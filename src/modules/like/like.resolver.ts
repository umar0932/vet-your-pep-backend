import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'

import { Allow, CurrentUser, JwtUserPayload } from '@app/common'

import { CreateLikeInput, ListLikesInput, UpdateLikeInput } from './dto/inputs'
import { Likes } from './entities'
import { LikeService } from './like.service'
import { ListLikesResponse } from './dto/args'

@Resolver(() => Likes)
export class LikeResolver {
  constructor(private readonly likeService: LikeService) {}

  // Queries

  @Query(() => ListLikesResponse, {
    description: 'The List of likes with Pagination and filters'
  })
  @Allow()
  async getLikes(
    @Args('input') listLikesInput: ListLikesInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<ListLikesResponse> {
    const [likes, count, limit, offset] = await this.likeService.getLikesWithPagination(
      listLikesInput,
      user
    )
    return { results: likes, totalRows: count, limit, offset }
  }

  // Mutations

  @Mutation(() => Likes, {
    description: 'This will create new Like on Post'
  })
  @Allow()
  async likePost(
    @Args('input') createLikeInput: CreateLikeInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<Partial<Likes>> {
    return await this.likeService.likePost(createLikeInput, user.userId)
  }

  @Mutation(() => Likes, {
    description: 'This will unlike Post'
  })
  @Allow()
  async unlikePost(
    @Args('input') createLikeInput: UpdateLikeInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<Partial<Likes>> {
    return await this.likeService.unlikePost(createLikeInput, user.userId)
  }
}
