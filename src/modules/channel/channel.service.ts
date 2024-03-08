import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'

import { Brackets, EntityManager, Repository, SelectQueryBuilder } from 'typeorm'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { uuid } from 'uuidv4'

import { AdminService } from '@app/admin'
import { AwsS3ClientService } from '@app/aws-s3-client'
import { CustomerUserService } from '@app/customer-user'
import { JWT_STRATEGY_NAME, JwtUserPayload, SuccessResponse } from '@app/common'
import { S3SignedUrlResponse } from '@app/aws-s3-client/dto/args'

import { ChannelMember, Channel } from './entities'
import { ChannelUserRole, ChannelStatus } from './channel.constants'
import {
  CreateChannelInput,
  LeaveChannelInput,
  ListChannelsInput,
  UpdateChannelInput
} from './dto/inputs'

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

  async channelQuerBuilder(): Promise<SelectQueryBuilder<Channel>> {
    const queryBuilder = this.channelsRepository.createQueryBuilder('channels')
    return queryBuilder
  }

  async checkChannelMemberByIdExist(channelId: string, userId: string): Promise<boolean> {
    if (!userId) throw new BadRequestException('User Id is invalid')
    const checkChannelMemberExist = await this.channelMemberRepository.count({
      where: { channel: { id: channelId }, customer: { id: userId } }
    })

    if (checkChannelMemberExist > 0) return true

    return false
  }

  async getChannelByModeratorId(id: string, userId: string): Promise<Channel> {
    const findChannels = await this.channelsRepository.findOne({
      where: { id, moderatorId: userId }
    })
    if (!findChannels) throw new BadRequestException('Channel with the provided ID does not exist')

    return findChannels
  }

  async getChannelsByName(title: string): Promise<Channel | null> {
    const findChannelsByName = await this.channelsRepository.findOne({ where: { title } })

    return findChannelsByName
  }

  async getChannelMemberById(channelId: string, userId: string): Promise<ChannelMember> {
    const isChannelMember = await this.channelMemberRepository.findOne({
      where: { channel: { id: channelId }, customer: { id: userId } }
    })
    if (!isChannelMember)
      throw new BadRequestException('Channel Member with the provided ID does not exist')

    return isChannelMember
  }

  // Resolver Query Methods

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

  async getChannelsWithPagination(
    { limit, offset, filter, joined }: ListChannelsInput,
    user: JwtUserPayload
  ): Promise<[Channel[], number]> {
    const { title, search } = filter || {}
    const { userId, type } = user || {}

    try {
      const queryBuilder = this.channelsRepository.createQueryBuilder('channels')

      title && queryBuilder.andWhere('channels.title = :title', { title })

      if (search) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(channels.title) LIKE LOWER(:search)', { search: `%${search}%` })
          })
        )
      }

      queryBuilder
        .leftJoinAndSelect('channels.moderator', 'moderator')
        .leftJoinAndSelect('channels.members', 'channelMember')
        .leftJoinAndSelect('channels.posts', 'post')
        .leftJoinAndSelect('post.channel', 'postChannel')
        .leftJoinAndSelect('post.likes', 'likes')
        .leftJoinAndSelect('post.comments', 'comments')
        .leftJoinAndSelect('post.customer', 'user')
        .leftJoinAndSelect('likes.user', 'userLike')
        .leftJoinAndSelect('comments.user', 'userComments')
        .leftJoinAndSelect('channelMember.customer', 'customer')
        .take(limit)
        .skip(offset)

      if (type === JWT_STRATEGY_NAME.CUSTOMER) {
        if (joined) {
          queryBuilder.where('customer.id = :userId', { userId })
        } else {
          const subQueryBuilder = this.manager
            .createQueryBuilder(Channel, 'channels')
            .leftJoin('channels.members', 'cm')
            .andWhere('cm.customer.id = :userId', { userId })
            .select('channels.id')

          queryBuilder
            .andWhere('channels.id NOT IN (' + subQueryBuilder.getQuery() + ')')
            .setParameters(subQueryBuilder.getParameters())
        }
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
    user: JwtUserPayload
  ): Promise<SuccessResponse> {
    await this.adminService.adminOnlyAccess(user.type)
    return this.manager.transaction(async transactionalManager => {
      const { userId } = user
      const { title, moderatorId, status, totalPrice, ...rest } = createChannelInput

      const moderator = await this.customerService.getCustomerById(moderatorId)

      const channelExists = await this.getChannelsByName(title)
      if (channelExists) throw new BadRequestException('Channel Name already exists')

      if (status === ChannelStatus.PRIVATE && totalPrice <= 1)
        throw new BadRequestException('Channel price should be greater than 1')

      try {
        const channel = await transactionalManager.save(Channel, {
          ...rest,
          title,
          status,
          isPaid: status === ChannelStatus.PRIVATE ? true : false,
          totalPrice,
          moderatorId: moderatorId,
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
        const checkChannelMemberExist = await this.checkChannelMemberByIdExist(channel.id, userId)
        if (checkChannelMemberExist) throw new BadRequestException('User is already a member')

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
        const checkChannelMemberExist = await this.checkChannelMemberByIdExist(channel.id, userId)
        if (checkChannelMemberExist) throw new BadRequestException('User is already a member')

        return { success: false, message: 'Channel is private.' }
      } else throw new BadRequestException('Cannot join a non-public channel.')

      return { success: true, message: 'User joined the channel.' }
    })
  }

  async updateChannel(
    updateChannelInput: UpdateChannelInput,
    user: JwtUserPayload
  ): Promise<SuccessResponse> {
    const { id, title, ...rest } = updateChannelInput
    const { userId, type } = user || {}

    let channel
    if (type === JWT_STRATEGY_NAME.CUSTOMER)
      channel = await this.getChannelByModeratorId(id, userId)
    else channel = await this.getChannelById(id)

    // if (moderatorId) await this.customerService.getCustomerById(moderatorId)

    if (title) {
      const channelByName = await this.getChannelsByName(title)
      if (channelByName && channelByName.id !== id)
        throw new BadRequestException('Same Channel Name already exists')
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

  async leaveChannel(
    leaveChannelInput: LeaveChannelInput,
    user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return this.manager.transaction(async transactionalManager => {
      const { channelId, customerId } = leaveChannelInput || {}
      const { userId, type } = user || {}

      try {
        if (type === JWT_STRATEGY_NAME.CUSTOMER) {
          const channelModerator = await this.getChannelByModeratorId(channelId, userId)
          if (channelModerator)
            throw new ForbiddenException('Moderators can not leave the channel.')
        }

        const channel = await this.getChannelById(channelId)

        let channelMember
        if (type === JWT_STRATEGY_NAME.ADMIN && customerId) {
          channelMember = await this.getChannelMemberById(channel.id, customerId)
        } else if (type === JWT_STRATEGY_NAME.CUSTOMER) {
          channelMember = await this.getChannelMemberById(channel.id, userId)
        }
        await transactionalManager.delete(ChannelMember, channelMember.id)
        await this.updateTotalMembersCount(transactionalManager, channel, 'decrement', userId)

        return { success: true, message: 'User left the channel.' }
      } catch (error) {
        throw new BadRequestException('Failed to leave the channel.')
      }
    })
  }
}
