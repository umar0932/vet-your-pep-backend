import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'

import { Brackets, EntityManager, Repository } from 'typeorm'

import { AdminService } from '@app/admin'
import { CustomerUserService } from '@app/customer-user'
import { JWT_STRATEGY_NAME, JwtUserPayload, SuccessResponse } from '@app/common'

import { Comments } from './entities'
import { CreateCommentInput, ListCommentsInput, UpdateCommentInput } from './dto/inputs'
import { PostService } from '@app/post'

@Injectable()
export class CommentService {
  constructor(
    private adminService: AdminService,
    private postService: PostService,
    @InjectRepository(Comments)
    private commentRepository: Repository<Comments>,
    private customerService: CustomerUserService,
    @InjectEntityManager() private readonly manager: EntityManager
  ) {}

  // Private Methods

  // Public Methods
  async getCommentsById(id: number, postId: string): Promise<Comments> {
    const findComments = await this.commentRepository.findOne({
      where: { id, post: { id: postId } }
    })
    if (!findComments) throw new BadRequestException('Comments with the provided ID does not exist')

    return findComments
  }

  // Resolver Query Methods

  async getCommentsWithPagination(
    { limit, offset, filter }: ListCommentsInput,
    user: JwtUserPayload
  ): Promise<[Comments[], number]> {
    const { search } = filter || {}
    const { userId, type } = user || {}

    if (type === JWT_STRATEGY_NAME.ADMIN) await this.adminService.getAdminById(userId)

    try {
      const queryBuilder = await this.commentRepository.createQueryBuilder('comments')

      if (search) {
        await queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(comments.contennt) LIKE LOWER(:search)', { search: `%${search}%` })
          })
        )
      }

      await queryBuilder
        .take(limit)
        .skip(offset)
        .leftJoinAndSelect('comments.post', 'post')
        .leftJoinAndSelect('comments.user', 'user')

      if (type === JWT_STRATEGY_NAME.CUSTOMER)
        await queryBuilder.where('user.id = :userId', { userId })

      const [channels, total] = await queryBuilder.getManyAndCount()

      return [channels, total]
    } catch (error) {
      throw new BadRequestException('Failed to find Channel')
    }
  }

  // Resolver Mutation Methods

  async createComment(
    createCommentInput: CreateCommentInput,
    userId: string
  ): Promise<SuccessResponse> {
    const { postId, ...rest } = createCommentInput

    const customer = await this.customerService.getCustomerById(userId)

    const post = await this.postService.findFromAllPost(postId)

    try {
      await this.commentRepository.save({
        ...rest,
        post: post,
        user: { id: customer.id },
        createdBy: userId
      })
    } catch (error) {
      throw new BadRequestException('Failed to create post')
    }

    return { success: true, message: 'Comments Created' }
  }

  async updateComment(
    updateCommentInput: UpdateCommentInput,
    userId: string
  ): Promise<SuccessResponse> {
    const { commentId, postId, ...rest } = updateCommentInput

    const comments = await this.getCommentsById(commentId, postId)

    await this.customerService.getCustomerById(userId)

    const post = await this.postService.findFromAllPost(postId)

    try {
      await this.commentRepository.update(comments.id, {
        ...rest,
        post,
        user: { id: userId },
        updatedBy: userId,
        updatedDate: new Date()
      })
    } catch (error) {
      throw new BadRequestException('Failed to update post')
    }

    return { success: true, message: 'Comments Updated' }
  }
}
