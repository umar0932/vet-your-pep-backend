import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'

import { Allow, CurrentUser, JwtUserPayload, SuccessResponse } from '@app/common'
import { S3SignedUrlResponse } from '@app/aws-s3-client/dto/args'

import { Post } from './entities'
import { PostService } from './post.service'
import { CreatePostInput } from './dto/inputs'
// import { ListPostsResponse } from './dto/args'

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  // Queries

  @Query(() => [S3SignedUrlResponse], {
    description: 'Get S3 bucket Signed Url'
  })
  @Allow()
  async getPostUploadUrls(
    @Args({ name: 'count', type: () => Number }) count: number
  ): Promise<S3SignedUrlResponse[]> {
    return this.postService.getPostUploadUrls(count)
  }

  // Mutations

  @Mutation(() => SuccessResponse, {
    description: 'This will create new Post'
  })
  @Allow()
  async createPost(
    @Args('input') createPostInput: CreatePostInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.postService.createPost(createPostInput, user.userId)
  }
}
