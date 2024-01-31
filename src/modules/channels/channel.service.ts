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

import { ChannelMember, Channel } from './entities'
import { ChannelUserRole, ChannelStatus } from './channel.constants'
import { CreateChannelInput, ListChannelsInput, UpdateChannelInput } from './dto/inputs'

@Injectable()
export class ChannelService {
  constructor(
    private adminService: AdminService,
    private configService: ConfigService,
    private customerService: CustomerUserService,
    @InjectRepository(ChannelMember)
    private channelMemberRepository: Repository<ChannelMember>,
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
    @InjectEntityManager() private readonly manager: EntityManager,
    private s3Service: AwsS3ClientService
  ) {}

  async getChannelById(idChannel: string): Promise<Channel> {
    const findChannels = await this.channelsRepository.findOne({
      where: { idChannel }
    })
    if (!findChannels) throw new BadRequestException('Channel with the provided ID does not exist')

    return findChannels
  }

  async getChannelByModeratorId(idChannel: string, userId: string): Promise<Channel> {
    const findChannels = await this.channelsRepository.findOne({
      where: { idChannel, refIdModerator: userId }
    })
    if (!findChannels) throw new BadRequestException('Channel with the provided ID does not exist')

    return findChannels
  }

  async getChannelMemberById(channel: Channel, userId: string): Promise<ChannelMember> {
    const isChannelMember = await this.channelMemberRepository.findOne({
      where: { channel, customer: { id: userId } }
    })
    if (!isChannelMember)
      throw new BadRequestException('Channel Member with the provided ID does not exist')

    return isChannelMember
  }

  async checkChannelMemberByIdExist(idChannel: string, userId: string): Promise<void> {
    if (!userId) throw new BadRequestException('User Id is invalid')
    const checkChannelMemberExist = await this.channelMemberRepository.count({
      where: { channel: { idChannel }, customer: { id: userId } }
    })

    if (checkChannelMemberExist > 0) throw new BadRequestException('User is already a member')
  }

  async getChannelsByName(channelTitle: string): Promise<boolean> {
    const findChannelsByName = await this.channelsRepository.count({ where: { channelTitle } })
    if (findChannelsByName > 0) return true
    return false
  }

  async createChannel(
    createChannelInput: CreateChannelInput,
    userId: string
  ): Promise<SuccessResponse> {
    return this.manager.transaction(async transactionalManager => {
      await this.adminService.getAdminById(userId)
      const { channelTitle, refIdModerator, channelStatus, totalPrice, ...rest } =
        createChannelInput

      let moderator
      if (refIdModerator) moderator = await this.customerService.getCustomerById(refIdModerator)

      const channelExists = await this.getChannelsByName(channelTitle)
      if (channelExists) throw new BadRequestException('Channel Name already exists')

      if (channelStatus == ChannelStatus.PRIVATE && totalPrice <= 1)
        throw new BadRequestException('Channel price should be greater than 1')

      try {
        const channel = await transactionalManager.save(Channel, {
          ...rest,
          channelTitle,
          channelStatus,
          isChannelPaid: ChannelStatus.PRIVATE ? true : false,
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
    updateChannelInput: UpdateChannelInput,
    userId: string,
    userType: string
  ): Promise<SuccessResponse> {
    const { idChannel, channelTitle, ...rest } = updateChannelInput

    let channel
    if (userType === 'admin') channel = await this.getChannelById(idChannel)
    if (userType === 'customer') channel = await this.getChannelByModeratorId(idChannel, userId)

    if (channel.channelTitle !== channelTitle) {
      const channelByName = await this.getChannelsByName(channelTitle)
      if (channelByName) throw new BadRequestException('Same Channel Name already exists')
    }

    try {
      await this.channelsRepository.update(channel.idChannel, {
        ...rest,
        channelTitle,
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
  }: ListChannelsInput): Promise<[Channel[], number]> {
    const { channelTitle, search } = filter || {}

    try {
      const queryBuilder = await this.channelsRepository.createQueryBuilder('channels')

      channelTitle &&
        queryBuilder.andWhere('channels.channelTitle = :channelTitle', { channelTitle })

      if (search) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(channels.channelTitle) LIKE LOWER(:search)', { search: `%${search}%` })
          })
        )
      }

      const [channels, total] = await queryBuilder.take(limit).skip(offset).getManyAndCount()

      return [channels, total]
    } catch (error) {
      throw new BadRequestException('Failed to find Channel')
    }
  }

  async joinChannel(idChannel: string, userId: string): Promise<SuccessResponse> {
    const channel = await this.getChannelById(idChannel)
    const { channelStatus } = channel

    if (channelStatus === ChannelStatus.PUBLIC) {
      await this.checkChannelMemberByIdExist(channel.idChannel, userId)

      try {
        await this.channelMemberRepository.save({
          channel,
          customer: { id: userId },
          roleChannel: ChannelUserRole.MEMBER,
          createdBy: userId
        })
      } catch (error) {
        throw new BadRequestException('Failed to join the channel.')
      }
    } else if (channelStatus === ChannelStatus.PRIVATE) {
      await this.checkChannelMemberByIdExist(channel.idChannel, userId)
      return { success: false, message: 'Channel is private.' }
    } else {
      throw new BadRequestException('Cannot join a non-public channel.')
    }

    return { success: true, message: 'User joined the channel.' }
  }
}
