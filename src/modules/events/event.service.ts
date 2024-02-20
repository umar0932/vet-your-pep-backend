import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'

import { Brackets, EntityManager, Repository } from 'typeorm'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { uuid } from 'uuidv4'

import { AdminService } from '@app/admin'
import { AwsS3ClientService } from '@app/aws-s3-client'
import { ChannelService } from '@app/channel'
import { CustomerUserService } from '@app/customer-user'
import { JWT_STRATEGY_NAME, JwtUserPayload, SuccessResponse } from '@app/common'
import { S3SignedUrlResponse } from '@app/aws-s3-client/dto/args'

import { CreateEventInput, ListEventsInput, UpdateEventInput } from './dto/inputs'
import { Events } from './entities'

@Injectable()
export class EventService {
  constructor(
    private adminService: AdminService,
    private configService: ConfigService,
    private channelService: ChannelService,
    private customerService: CustomerUserService,
    @InjectRepository(Events)
    private eventRepository: Repository<Events>,
    @InjectEntityManager() private readonly manager: EntityManager,
    private s3Service: AwsS3ClientService
  ) {}

  // Private Methods

  // Public Methods

  async getEventById(id: number, userId: string): Promise<Events> {
    const findEvents = await this.eventRepository.findOne({
      where: { id, createdBy: userId }
    })
    if (!findEvents) throw new NotFoundException('Event with the provided ID does not exist')

    return findEvents
  }

  async getEventByName(title: string): Promise<boolean> {
    const findEventByName = await this.eventRepository.count({ where: { title } })
    if (findEventByName > 0) return true
    return false
  }

  async findFromAllEvent(id: number): Promise<Events> {
    const findEvents = await this.eventRepository.findOne({
      where: { id }
    })
    if (!findEvents) throw new BadRequestException('Event with the provided ID does not exist')

    return findEvents
  }

  // Resolver Query Methods

  async getEventUploadUrls(count: number): Promise<S3SignedUrlResponse[]> {
    if (!count) throw new BadRequestException('Count cannot be less than 1')
    const urls: S3SignedUrlResponse[] = []

    for (let i = 0; i < count; i++) {
      const key = `user_event_image_uploads/${uuid()}-event-upload`
      const bucketName = this.configService.get('USER_UPLOADS_BUCKET')

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key
      })
      const url = await getSignedUrl(this.s3Service.getClient(), command, {
        expiresIn: 3600
      })
      urls.push({
        signedUrl: url,
        fileName: key
      })
    }

    return urls
  }

  async getEventsWithPagination(
    { limit, offset, filter }: ListEventsInput,
    user: JwtUserPayload
  ): Promise<[Events[], number]> {
    const { search } = filter || {}
    const { userId, type } = user || {}

    try {
      const queryBuilder = await this.eventRepository.createQueryBuilder('events')

      if (search) {
        await queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(events.title) LIKE LOWER(:search)', { search: `%${search}%` })
          })
        )
      }

      await queryBuilder.take(limit).skip(offset).leftJoinAndSelect('events.channel', 'channel')

      if (type === JWT_STRATEGY_NAME.CUSTOMER)
        await queryBuilder.where('customer.id = :userId', { userId })

      const [channels, total] = await queryBuilder.getManyAndCount()

      return [channels, total]
    } catch (error) {
      throw new BadRequestException('Failed to find Channel')
    }
  }

  // Resolver Mutation Methods

  async createEvent(
    createEventInput: CreateEventInput,
    user: JwtUserPayload
  ): Promise<SuccessResponse> {
    if (user.type !== JWT_STRATEGY_NAME.ADMIN) throw new ForbiddenException('Only Admins Access')
    const { channelId, title, ...rest } = createEventInput

    const channel = await this.channelService.getChannelById(channelId)

    const eventExists = channel.events.some(event => event.title === title)
    if (eventExists) throw new BadRequestException('Event title already exists')

    try {
      await this.eventRepository.save({
        ...rest,
        title,
        channel,
        createdBy: user.userId
      })
    } catch (error) {
      throw new BadRequestException('Failed to create event')
    }

    return { success: true, message: 'Event Created' }
  }

  async updateEvent(
    updateEventInput: UpdateEventInput,
    user: JwtUserPayload
  ): Promise<SuccessResponse> {
    if (user.type !== JWT_STRATEGY_NAME.ADMIN) throw new ForbiddenException('Only Admins Access')
    const { channelId, eventId, title, ...rest } = updateEventInput

    await this.getEventById(eventId, user.userId)

    const channel = await this.channelService.getChannelById(channelId)

    const eventExists = channel.events.some(event => event.title === title)
    if (eventExists) throw new BadRequestException('Event title already exists')

    try {
      await this.eventRepository.update(eventId, {
        ...rest,
        title,
        channel,
        updatedBy: user.userId,
        updatedDate: new Date()
      })
    } catch (error) {
      throw new BadRequestException('Failed to update event')
    }

    return { success: true, message: 'Event Updated' }
  }
}
