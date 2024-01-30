import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'

import { Brackets, EntityManager, Repository } from 'typeorm'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { uuid } from 'uuidv4'

import { AdminService } from '@app/admin'
import { SuccessResponse } from '@app/common'
import { AwsS3ClientService } from '@app/aws-s3-client'
import { CustomerUserService } from '@app/customer-user'
import { S3SignedUrlResponse } from '@app/aws-s3-client/dto/args'

import { ChannelMember, Channels } from './entities'
import { ChannelUserRole } from './channels.constants'
import { CreateChannelsInput, ListChannelsInputs, UpdateChannelsInput } from './dto/inputs'

@Injectable()
export class ChannelsService {
  constructor(
    private adminService: AdminService,
    private configService: ConfigService,
    private customerService: CustomerUserService,
    @InjectRepository(ChannelMember)
    private channelMemberRepository: Repository<ChannelMember>,
    @InjectRepository(Channels)
    private channelsRepository: Repository<Channels>,
    @InjectEntityManager() private readonly manager: EntityManager,
    private s3Service: AwsS3ClientService
  ) {}

  async getChannelById(idChannel: string, userId: string): Promise<Channels> {
    const findChannels = await this.channelsRepository.findOne({
      where: { idChannel, refIdModerator: userId }
    })
    if (!findChannels) throw new BadRequestException('Channel with the provided ID does not exist')

    return findChannels
  }

  async getChannelsByName(channelsTitle: string): Promise<boolean> {
    const findChannelsByName = await this.channelsRepository.count({ where: { channelsTitle } })
    if (findChannelsByName > 0) return true
    return false
  }

  async createChannel(
    createChannelsInput: CreateChannelsInput,
    userId: string
  ): Promise<SuccessResponse> {
    return this.manager.transaction(async transactionalManager => {
      await this.adminService.getAdminById(userId)
      const { channelsTitle, refIdModerator, channelStatus, totalPrice, ...rest } =
        createChannelsInput

      let moderator
      if (refIdModerator) moderator = await this.customerService.getCustomerById(refIdModerator)

      const channelExists = await this.getChannelsByName(channelsTitle)
      if (channelExists) throw new BadRequestException('Channel Name already exists')

      if (channelStatus == 'PRIVATE' && totalPrice <= 1)
        throw new BadRequestException('Channel price should be greater than 1')

      try {
        const channel = await transactionalManager.save(Channels, {
          ...rest,
          channelsTitle,
          channelStatus,
          totalPrice,
          refIdModerator: moderator.id,
          createdBy: userId
        })

        await transactionalManager.save(ChannelMember, {
          channel,
          customer: moderator,
          roleChannel: ChannelUserRole.MODERATOR,
          createdBy: userId
        })
      } catch (error) {
        throw new BadRequestException('Failed to create channel')
      }

      return { success: true, message: 'Channel Created' }
    })
  }

  async updateChannel(
    updateChannelsInput: UpdateChannelsInput,
    userId: string
  ): Promise<SuccessResponse> {
    const { idChannel, channelsTitle, ...rest } = updateChannelsInput

    const channel = await this.getChannelById(idChannel, userId)

    if (channel.channelsTitle !== channelsTitle) {
      const channelByName = await this.getChannelsByName(channelsTitle)
      if (channelByName) throw new BadRequestException('Same Channel Name already exists')
    }

    try {
      await this.channelsRepository.update(channel.idChannel, {
        ...rest,
        channelsTitle,
        updatedBy: userId,
        updatedDate: new Date()
      })
    } catch (error) {
      throw new BadRequestException('Failed to update Channel')
    }

    return { success: true, message: 'Channel updated' }
  }

  async getChannelsUploadUrl(): Promise<S3SignedUrlResponse> {
    const key = `channel_image_uploads/${uuid()}-channel-upload`
    const bucketName = this.configService.get('USER_UPLOADS_BUCKET')

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key
    })

    const url = await getSignedUrl(this.s3Service.getClient(), command, {
      expiresIn: 3600
    })

    return {
      signedUrl: url,
      fileName: key
    }
  }

  async findAllChannelsWithPagination({
    limit,
    offset,
    filter
  }: ListChannelsInputs): Promise<[Channels[], number]> {
    const { channelsTitle, search } = filter || {}

    try {
      const queryBuilder = await this.channelsRepository.createQueryBuilder('channels')

      channelsTitle &&
        queryBuilder.andWhere('channels.channelsTitle = :channelsTitle', { channelsTitle })

      if (search) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(channels.channelsTitle) LIKE LOWER(:search)', { search: `%${search}%` })
          })
        )
      }

      const [channels, total] = await queryBuilder.take(limit).skip(offset).getManyAndCount()

      return [channels, total]
    } catch (error) {
      throw new BadRequestException('Failed to find Channels')
    }
  }
}
