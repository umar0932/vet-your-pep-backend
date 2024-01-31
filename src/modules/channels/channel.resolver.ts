import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'

import { Allow, CurrentUser, JwtUserPayload, SuccessResponse } from '@app/common'
import { S3SignedUrlResponse } from '@app/aws-s3-client/dto/args'

import { Channel } from './entities'
import { ChannelService } from './channel.service'
import { CreateChannelInput, ListChannelsInput, UpdateChannelInput } from './dto/inputs'
import { ListChannelsResponse } from './dto/args'

@Resolver(() => Channel)
export class ChannelResolver {
  constructor(private readonly channelsService: ChannelService) {}

  @Mutation(() => SuccessResponse, {
    description: 'This will create new Channel'
  })
  @Allow()
  async createChannel(
    @Args('input') createChannelInput: CreateChannelInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.channelsService.createChannel(createChannelInput, user.userId)
  }

  @Mutation(() => SuccessResponse, {
    description: 'This will create new Channel'
  })
  @Allow()
  async updateChannel(
    @Args('input') updateChannelInput: UpdateChannelInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.channelsService.updateChannel(updateChannelInput, user.userId, user.type)
  }

  @Query(() => S3SignedUrlResponse, {
    description: 'Get S3 bucket Signed Url'
  })
  @Allow()
  async getChannelsUploadUrl(): Promise<S3SignedUrlResponse> {
    return this.channelsService.getChannelsUploadUrl()
  }

  @Query(() => ListChannelsResponse, {
    description: 'The List of Channel with Pagination and filters'
  })
  @Allow()
  async getAllChannelsWithPagination(
    @Args('input') args: ListChannelsInput
  ): Promise<ListChannelsResponse> {
    const { limit, offset, filter } = args
    const [channels, count] = await this.channelsService.findAllChannelsWithPagination({
      limit,
      offset,
      filter
    })
    return { results: channels, totalRows: count, limit, offset }
  }

  @Mutation(() => SuccessResponse, {
    description: 'This will create new Channel'
  })
  @Allow()
  async joinChannel(
    @Args('idChannel') idChannel: string,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.channelsService.joinChannel(idChannel, user.userId)
  }
}
