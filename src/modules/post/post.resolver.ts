import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'

import { Allow, CurrentUser, JwtUserPayload, SuccessResponse } from '@app/common'
import { S3SignedUrlResponse } from '@app/aws-s3-client/dto/args'

import { CreatePostInput, ListPostsInput, UpdatePostInput } from './dto/inputs'
import { ListPostsResponse } from './dto/args'
import { Post } from './entities'
import { PostService } from './post.service'

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

  @Query(() => ListPostsResponse, {
    description: 'The List of posts with Pagination and filters'
  })
  @Allow()
  async getPosts(
    @Args('input') args: ListPostsInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<ListPostsResponse> {
    const [posts, count, limit, offset] = await this.postService.getPostsWithPagination(args, user)
    return { results: posts, totalRows: count, limit, offset }
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

  @Mutation(() => SuccessResponse, {
    description: 'This will update new Post'
  })
  @Allow()
  async updatePost(
    @Args('input') createPostInput: UpdatePostInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.postService.updatePost(createPostInput, user.userId)
  }
}
