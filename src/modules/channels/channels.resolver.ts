import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'

import { Allow, CurrentUser, JwtUserPayload, SuccessResponse } from '@app/common'
import { S3SignedUrlResponse } from '@app/aws-s3-client/dto/args'

import { Channels } from './entities'
import { ChannelsService } from './channels.service'
import { CreateChannelsInput, ListChannelsInputs, UpdateChannelsInput } from './dto/inputs'
import { ListChannelsResponse } from './dto/args'

@Resolver(() => Channels)
export class ChannelsResolver {
  constructor(private readonly channelsService: ChannelsService) {}

  @Mutation(() => SuccessResponse, {
    description: 'This will create new Channels'
  })
  @Allow()
  async createChannel(
    @Args('input') createChannelsInput: CreateChannelsInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.channelsService.createChannel(createChannelsInput, user.userId)
  }

  @Mutation(() => SuccessResponse, {
    description: 'This will create new Channels'
  })
  @Allow()
  async updateChannel(
    @Args('input') updateChannelsInput: UpdateChannelsInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.channelsService.updateChannel(updateChannelsInput, user.userId)
  }

  @Query(() => S3SignedUrlResponse, {
    description: 'Get S3 bucket Signed Url'
  })
  @Allow()
  async getChannelsUploadUrl(): Promise<S3SignedUrlResponse> {
    return this.channelsService.getChannelsUploadUrl()
  }

  @Query(() => ListChannelsResponse, {
    description: 'The List of Channels with Pagination and filters'
  })
  @Allow()
  async getAllChannelsWithPagination(
    @Args('input') args: ListChannelsInputs
  ): Promise<ListChannelsResponse> {
    const { limit, offset, filter } = args
    const [channels, count] = await this.channelsService.findAllChannelsWithPagination({
      limit,
      offset,
      filter
    })
    return { results: channels, totalRows: count }
  }
}
