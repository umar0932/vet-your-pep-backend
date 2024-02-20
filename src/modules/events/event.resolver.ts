import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'

import { Allow, CurrentUser, JwtUserPayload, SuccessResponse } from '@app/common'
import { S3SignedUrlResponse } from '@app/aws-s3-client/dto/args'

import { CreateEventInput, ListEventsInput, UpdateEventInput } from './dto/inputs'
import { ListEventsResponse } from './dto/args'
import { Events } from './entities'
import { EventService } from './event.service'

@Resolver(() => Events)
export class EventResolver {
  constructor(private readonly postService: EventService) {}

  // Queries

  @Query(() => [S3SignedUrlResponse], {
    description: 'Get S3 bucket Signed Url'
  })
  @Allow()
  async getEventUploadUrls(
    @Args({ name: 'count', type: () => Number }) count: number
  ): Promise<S3SignedUrlResponse[]> {
    return this.postService.getEventUploadUrls(count)
  }

  @Query(() => ListEventsResponse, {
    description: 'The List of posts with Pagination and filters'
  })
  @Allow()
  async getEvents(
    @Args('input') args: ListEventsInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<ListEventsResponse> {
    const { limit, offset, filter } = args
    const [posts, count] = await this.postService.getEventsWithPagination(
      {
        limit,
        offset,
        filter
      },
      user
    )
    return { results: posts, totalRows: count, limit, offset }
  }

  // Mutations

  @Mutation(() => SuccessResponse, {
    description: 'This will create new Event'
  })
  @Allow()
  async createEvent(
    @Args('input') createEventInput: CreateEventInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.postService.createEvent(createEventInput, user)
  }

  @Mutation(() => SuccessResponse, {
    description: 'This will update new Event'
  })
  @Allow()
  async updateEvent(
    @Args('input') createEventInput: UpdateEventInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.postService.updateEvent(createEventInput, user)
  }
}
