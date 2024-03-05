import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
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
import { CalenderEvents, Events } from './entities'
import { PartialEventResponse } from './dto/args'

@Injectable()
export class EventService {
  constructor(
    private adminService: AdminService,
    private configService: ConfigService,
    private channelService: ChannelService,
    private customerService: CustomerUserService,
    @InjectRepository(CalenderEvents)
    private eventCalenderRepository: Repository<CalenderEvents>,
    @InjectRepository(Events)
    private eventRepository: Repository<Events>,
    @InjectEntityManager() private readonly manager: EntityManager,
    private s3Service: AwsS3ClientService
  ) {}

  // Private Methods

  // Public Methods

  async checkEventCalenderByIdExist(eventId: string, userId: string): Promise<boolean> {
    if (!userId) throw new BadRequestException('User Id is invalid')
    const checkEventCalenderExist = await this.eventCalenderRepository.count({
      where: { event: { id: eventId }, customer: { id: userId } }
    })

    if (checkEventCalenderExist > 0) return true

    return false
  }

  async getEventByName(title: string): Promise<boolean> {
    const findEventByName = await this.eventRepository.count({ where: { title } })
    if (findEventByName > 0) return true
    return false
  }

  async getEventCalenderById(eventId: string, userId: string): Promise<CalenderEvents> {
    const isEventCalender = await this.eventCalenderRepository.findOne({
      where: { event: { id: eventId }, customer: { id: userId } }
    })
    if (!isEventCalender)
      throw new BadRequestException('Event Calender with the provided ID does not exist')

    return isEventCalender
  }

  async findFromAllEvent(id: string): Promise<Events> {
    const findEvents = await this.eventRepository.findOne({
      where: { id }
    })
    if (!findEvents) throw new BadRequestException('Event with the provided ID does not exist')

    return findEvents
  }

  // Resolver Query Methods

  async getEventByChannelId(channelId: string): Promise<PartialEventResponse> {
    const events = await this.eventRepository.findOne({
      where: { channel: { id: channelId } }
    })
    if (!events) throw new NotFoundException('Event with the provided ID does not exist')

    return { results: [events] }
  }

  async getEventById(id: string): Promise<Events> {
    const findEvents = await this.eventRepository.findOne({
      where: { id },
      relations: ['channel']
    })
    if (!findEvents) throw new NotFoundException('Event with the provided ID does not exist')

    return findEvents
  }

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
    listEventsInput: ListEventsInput,
    user: JwtUserPayload
  ): Promise<[Events[], number, number, number]> {
    const { limit, offset, filter, channelId, calenderEvents } = listEventsInput
    const { search } = filter || {}
    const { userId, type } = user || {}

    try {
      const queryBuilder = this.eventRepository.createQueryBuilder('events')

      queryBuilder.take(limit).skip(offset).leftJoinAndSelect('events.channel', 'channel')

      if (channelId) queryBuilder.andWhere('channel.id = :channelId', { channelId })
      if (calenderEvents) {
        queryBuilder
          .leftJoin('events.calenderEvents', 'ce')
          .andWhere('ce.customer.id = :userId', { userId })
          .andWhere('ce.addToCalender = :addToCalender', { addToCalender: true })
      }
      if (type === JWT_STRATEGY_NAME.CUSTOMER) {
        queryBuilder
          .leftJoinAndSelect('channel.members', 'cm')
          .where('cm.customer.id = :userId', { userId })
          .andWhere('channel.id = :channelId', { channelId })
      }

      if (search) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(events.title) LIKE LOWER(:search)', { search: `%${search}%` })
          })
        )
      }

      const [events, total] = await queryBuilder.getManyAndCount()

      return [events, total, limit, offset]
    } catch (error) {
      throw new BadRequestException('Failed to find Event')
    }
  }

  // Resolver Mutation Methods

  async addToCalender(eventId: string, user: JwtUserPayload): Promise<SuccessResponse> {
    const event = await this.getEventById(eventId)

    try {
      await this.eventCalenderRepository.save({
        addToCalender: true,
        event,
        customer: { id: user.userId },
        createdBy: user.userId
      })
    } catch (error) {
      console.log(error)
      throw new BadRequestException('Failed to add Calender Event')
    }

    return { success: true, message: 'Event Added to the calender' }
  }

  async createEvent(
    createEventInput: CreateEventInput,
    user: JwtUserPayload
  ): Promise<SuccessResponse> {
    await this.adminService.adminOnlyAccess(user.type)
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

  async removeFromCalender(eventId: string, user: JwtUserPayload): Promise<SuccessResponse> {
    const eventCalender = await this.getEventCalenderById(eventId, user.userId)

    try {
      await this.eventCalenderRepository.delete(eventCalender.id)
    } catch (error) {
      throw new BadRequestException('Failed to remove Calender Event')
    }

    return { success: true, message: 'Event removed from the calender' }
  }

  async updateEvent(
    updateEventInput: UpdateEventInput,
    user: JwtUserPayload
  ): Promise<SuccessResponse> {
    await this.adminService.adminOnlyAccess(user.type)
    const { channelId, eventId, title, ...rest } = updateEventInput

    await this.getEventById(eventId)

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
