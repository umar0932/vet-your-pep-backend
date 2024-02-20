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
    description: 'This will create new Like on Post'
  })
  @Allow()
  async likePost(
    @Args('input') createLikeInput: CreateLikeInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.likeService.likePost(createLikeInput, user.userId)
  }

  @Mutation(() => SuccessResponse, {
    description: 'This will unlike Post'
  })
  @Allow()
  async unlikePost(
    @Args('input') createLikeInput: UpdateLikeInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.likeService.unlikePost(createLikeInput, user.userId)
  }
}
