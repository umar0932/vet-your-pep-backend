import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'

import { Allow, CurrentUser, JwtUserPayload, SuccessResponse } from '@app/common'
import { S3SignedUrlResponse } from '@app/aws-s3-client/dto/args'

import { CreateEventInput, ListEventsInput, UpdateEventInput } from './dto/inputs'
import { ListEventsResponse } from './dto/args'
import { Events } from './entities'
import { EventService } from './event.service'

@Resolver(() => Events)
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  // Queries

  @Query(() => [S3SignedUrlResponse], {
    description: 'Get S3 bucket Signed Url'
  })
  @Allow()
  async getEventUploadUrls(
    @Args({ name: 'count', type: () => Number }) count: number
  ): Promise<S3SignedUrlResponse[]> {
    return this.eventService.getEventUploadUrls(count)
  }

  @Query(() => ListEventsResponse, {
    description: 'The List of events with Pagination and filters'
  })
  @Allow()
  async getEvents(
    @Args('input') args: ListEventsInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<ListEventsResponse> {
    const { limit, offset, filter } = args
    const [events, count] = await this.eventService.getEventsWithPagination(
      {
        limit,
        offset,
        filter
      },
      user
    )
    return { results: events, totalRows: count, limit, offset }
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
    return await this.eventService.createEvent(createEventInput, user)
  }

  @Mutation(() => SuccessResponse, {
    description: 'This will update Event'
  })
  @Allow()
  async updateEvent(
    @Args('input') createEventInput: UpdateEventInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.eventService.updateEvent(createEventInput, user)
  }
}
