import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'

import { Allow, CurrentUser, JwtUserPayload, SuccessResponse } from '@app/common'

import { CreateCommentInput, ListCommentsInput, UpdateCommentInput } from './dto/inputs'
import { ListCommentsResponse } from './dto/args'
import { Comments } from './entities'
import { CommentService } from './comment.service'

@Resolver(() => Comments)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  // Queries

  @Query(() => ListCommentsResponse, {
    description: 'The List of comments with Pagination and filters'
  })
  @Allow()
  async getComments(
    @Args('input') args: ListCommentsInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<ListCommentsResponse> {
    const { limit, offset, filter } = args
    const [comments, count] = await this.commentService.getCommentsWithPagination(
      {
        limit,
        offset,
        filter
      },
      user
    )
    return { results: comments, totalRows: count, limit, offset }
  }

  // Mutations

  @Mutation(() => SuccessResponse, {
    description: 'This will create new Comment'
  })
  @Allow()
  async createComment(
    @Args('input') createCommentInput: CreateCommentInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.commentService.createComment(createCommentInput, user.userId)
  }

  @Mutation(() => SuccessResponse, {
    description: 'This will update new Comment'
  })
  @Allow()
  async updateComment(
    @Args('input') createCommentInput: UpdateCommentInput,
    @CurrentUser() user: JwtUserPayload
  ): Promise<SuccessResponse> {
    return await this.commentService.updateComment(createCommentInput, user.userId)
  }
}
