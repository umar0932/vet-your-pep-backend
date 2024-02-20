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

  // Queries

  @Query(() => Channel, {
    description: 'This will create get a Channel'
  })
  @Allow()
  async getChannelById(@Args('input') channelId: string): Promise<Partial<Channel>> {
    return this.channelsService.getChannelById(channelId)
  }

  @Query(() => S3SignedUrlResponse, {
    description: 'Get S3 bucket Signed Url'
  })
  @Allow()
  async getChannelUploadUrl(): Promise<S3SignedUrlResponse> {
    return this.channelsService.getChannelUploadUrl()
  }

  @Query(() => ListChannelsResponse, {
    description: 'The List of Channels user have joined or not with Pagination and filters'
  })
  @Allow()
  async getChannels(
    @Args('input') args: ListChannelsInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<ListChannelsResponse> {
    const { limit, joined, offset, filter } = args
    const [channels, count] = await this.channelsService.getChannelsWithPagination(
      {
        limit,
        joined,
        offset,
        filter
      },
      user
    )
    return { results: channels, totalRows: count, limit, offset }
  }

  // Mutations

  @Mutation(() => SuccessResponse, {
    description: 'This will create new Channel'
  })
  @Allow()
  async createChannel(
    @Args('input') createChannelInput: CreateChannelInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.channelsService.createChannel(createChannelInput, user)
  }

  @Mutation(() => SuccessResponse, {
    description: 'This will create new Channel'
  })
  @Allow()
  async joinChannel(
    @Args('channelId') channelId: string,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.channelsService.joinChannel(channelId, user.userId)
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
}
