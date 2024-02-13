import { Resolver, Mutation, Args } from '@nestjs/graphql'

import { Allow, CurrentUser, JwtUserPayload, SuccessResponse } from '@app/common'

import { CreateLikeInput, UpdateLikeInput } from './dto/inputs'
import { Likes } from './entities'
import { LikeService } from './like.service'

@Resolver(() => Likes)
export class LikeResolver {
  constructor(private readonly likeService: LikeService) {}

  // Queries

  // Mutations

  @Mutation(() => SuccessResponse, {
    description: 'This will create new Like'
  })
  @Allow()
  async createPostLike(
    @Args('input') createLikeInput: CreateLikeInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.likeService.createPostLike(createLikeInput, user.userId)
  }

  @Mutation(() => SuccessResponse, {
    description: 'This will update new Like'
  })
  @Allow()
  async updatePostLike(
    @Args('input') createLikeInput: UpdateLikeInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.likeService.updatePostLike(createLikeInput, user.userId)
  }
}
