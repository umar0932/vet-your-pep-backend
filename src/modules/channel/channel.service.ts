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

  // Private Methods

  private async updateTotalMembersCount(
    transactionalManager: EntityManager,
    channel: Channel,
    method: string,
    userId: string
  ): Promise<void> {
    try {
      if (method === 'increment') {
        await transactionalManager.update(Channel, channel.id, {
          totalMembers: Number(channel.totalMembers || 0) + 1,
          updatedBy: userId,
          updatedDate: new Date()
        })
      } else if (method === 'decrement') {
        await transactionalManager.update(Channel, channel.id, {
          totalMembers: Math.max(Number(channel.totalMembers || 0) - 1, 0),
          updatedBy: userId,
          updatedDate: new Date()
        })
      } else {
        throw new BadRequestException('Invalid method.')
      }
    } catch (error) {
      throw new BadRequestException('Error updating channel counts.')
    }
  }

  // Public Methods

  async checkChannelMemberByIdExist(channelId: string, userId: string): Promise<void> {
    if (!userId) throw new BadRequestException('User Id is invalid')
    const checkChannelMemberExist = await this.channelMemberRepository.count({
      where: { channel: { id: channelId }, customer: { id: userId } }
    })

    if (checkChannelMemberExist > 0) throw new BadRequestException('User is already a member')
  }

  async getChannelByModeratorId(id: string, userId: string): Promise<Channel> {
    const findChannels = await this.channelsRepository.findOne({
      where: { id, moderatorId: userId }
    })
    if (!findChannels) throw new BadRequestException('Channel with the provided ID does not exist')

    return findChannels
  }

  async getChannelsByName(title: string): Promise<boolean> {
    const findChannelsByName = await this.channelsRepository.count({ where: { title } })
    if (findChannelsByName > 0) return true
    return false
  }

  async getChannelMemberById(channel: Channel, userId: string): Promise<ChannelMember> {
    const isChannelMember = await this.channelMemberRepository.findOne({
      where: { channel, customer: { id: userId } }
    })
    if (!isChannelMember)
      throw new BadRequestException('Channel Member with the provided ID does not exist')

    return isChannelMember
  }

  // Resolver Query Methods

  async findAllChannelsWithPagination({
    limit,
    offset,
    filter
  }: ListChannelsInput): Promise<[Channel[], number]> {
    const { title, search } = filter || {}

    try {
      const queryBuilder = await this.channelsRepository.createQueryBuilder('channels')

      title && queryBuilder.andWhere('channels.title = :title', { title })

      if (search) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(channels.title) LIKE LOWER(:search)', { search: `%${search}%` })
          })
        )
      }

      const [channels, total] = await queryBuilder
        .take(limit)
        .skip(offset)
        .leftJoinAndSelect('channels.members', 'channelMember')
        .leftJoinAndSelect('channels.posts', 'post')
        .getManyAndCount()

      return [channels, total]
    } catch (error) {
      throw new BadRequestException('Failed to find Channel')
    }
  }

  async getChannelById(id: string): Promise<Channel> {
    const findChannel = await this.channelsRepository.findOne({
      where: { id },
      relations: ['members.customer']
    })
    if (!findChannel) throw new BadRequestException('Channel with the provided ID does not exist')

    return findChannel
  }

  async getChannelUploadUrl(): Promise<S3SignedUrlResponse> {
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

  async getMyChannelsWithPagination(
    { limit, offset, filter, joined }: ListChannelsInput,
    userId: string
  ): Promise<[Channel[], number]> {
    const { title, search } = filter || {}

    try {
      const queryBuilder = await this.channelsRepository.createQueryBuilder('channels')

      title && (await queryBuilder.andWhere('channels.title = :title', { title }))

      if (search) {
        await queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(channels.title) LIKE LOWER(:search)', { search: `%${search}%` })
          })
        )
      }

      await queryBuilder
        .take(limit)
        .skip(offset)
        .leftJoinAndSelect('channels.members', 'channelMember')
        .leftJoinAndSelect('channels.posts', 'post')
        .leftJoinAndSelect('channelMember.customer', 'customer')

      if (joined) {
        await queryBuilder.where('customer.id = :userId', { userId })
      } else {
        await queryBuilder.andWhere('customer.id <> :userId', { userId })
      }

      const [channels, total] = await queryBuilder.getManyAndCount()

      return [channels, total]
    } catch (error) {
      throw new BadRequestException('Failed to find Channel')
    }
  }

  // Resolver Mutation Methods

  async createChannel(
    createChannelInput: CreateChannelInput,
    userId: string
  ): Promise<SuccessResponse> {
    return this.manager.transaction(async transactionalManager => {
      await this.adminService.getAdminById(userId)
      const { title, moderatorId, status, totalPrice, ...rest } = createChannelInput

      let moderator
      if (moderatorId) moderator = await this.customerService.getCustomerById(moderatorId)

      const channelExists = await this.getChannelsByName(title)
      if (channelExists) throw new BadRequestException('Channel Name already exists')

      if (status == ChannelStatus.PRIVATE && totalPrice <= 1)
        throw new BadRequestException('Channel price should be greater than 1')

      try {
        const channel = await transactionalManager.save(Channel, {
          ...rest,
          title,
          status,
          isPaid: ChannelStatus.PRIVATE ? true : false,
          totalPrice,
          moderatorId: moderator.id,
          createdBy: userId
        })

        await transactionalManager.save(ChannelMember, {
          channel,
          customer: moderator,
          roleChannel: ChannelUserRole.MODERATOR,
          createdBy: userId
        })

        await this.updateTotalMembersCount(transactionalManager, channel, 'increment', userId)
      } catch (error) {
        throw new BadRequestException('Failed to create channel')
      }

      return { success: true, message: 'Channel Created' }
    })
  }

  async joinChannel(channelId: string, userId: string): Promise<SuccessResponse> {
    return this.manager.transaction(async transactionalManager => {
      const channel = await this.getChannelById(channelId)
      const { status } = channel

      if (status === ChannelStatus.PUBLIC) {
        await this.checkChannelMemberByIdExist(channel.id, userId)

        try {
          await transactionalManager.save(ChannelMember, {
            channel,
            customer: { id: userId },
            roleChannel: ChannelUserRole.MEMBER,
            createdBy: userId
          })

          await this.updateTotalMembersCount(transactionalManager, channel, 'increment', userId)
        } catch (error) {
          throw new BadRequestException('Failed to join the channel.')
        }
      } else if (status === ChannelStatus.PRIVATE) {
        await this.checkChannelMemberByIdExist(channel.id, userId)
        return { success: false, message: 'Channel is private.' }
      } else throw new BadRequestException('Cannot join a non-public channel.')

      return { success: true, message: 'User joined the channel.' }
    })
  }

  async updateChannel(
    updateChannelInput: UpdateChannelInput,
    userId: string,
    userType: string
  ): Promise<SuccessResponse> {
    const { id, title, ...rest } = updateChannelInput

    let channel
    if (userType === 'admin') channel = await this.getChannelById(id)
    if (userType === 'customer') channel = await this.getChannelByModeratorId(id, userId)

    if (channel.title !== title) {
      const channelByName = await this.getChannelsByName(title)
      if (channelByName) throw new BadRequestException('Same Channel Name already exists')
    }

    try {
      await this.channelsRepository.update(channel.id, {
        ...rest,
        title,
        updatedBy: userId,
        updatedDate: new Date()
      })
    } catch (error) {
      throw new BadRequestException('Failed to update Channel')
    }

    return { success: true, message: 'Channel updated' }
  }
}
