import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'

import { EntityManager, Repository } from 'typeorm'

import { CustomerUserService } from '@app/customer-user'
import { Post } from '@app/post/entities'
import { PostService } from '@app/post'
import { SuccessResponse } from '@app/common'

import { CreateLikeInput, UpdateLikeInput } from './dto/inputs'
import { Likes } from './entities'

@Injectable()
export class LikeService {
  constructor(
    private postService: PostService,
    private customerService: CustomerUserService,
    @InjectRepository(Likes)
    private likeRepository: Repository<Likes>,
    @InjectEntityManager() private readonly manager: EntityManager
  ) {}

  // Private Methods

  private async updateTotalLikeCount(
    transactionalManager: EntityManager,
    post: Post,
    method: string,
    userId: string
  ): Promise<void> {
    try {
      if (method === 'increment') {
        await transactionalManager.update(Post, post.id, {
          likeCount: Number(post.likeCount || 0) + 1,
          updatedBy: userId,
          updatedDate: new Date()
        })
      } else if (method === 'decrement') {
        await transactionalManager.update(Post, post.id, {
          likeCount: Math.max(Number(post.likeCount || 0) - 1, 0),
          updatedBy: userId,
          updatedDate: new Date()
        })
      } else {
        throw new BadRequestException('Invalid method.')
      }
    } catch (error) {
      throw new BadRequestException('Error updating like count.')
    }
  }

  // Public Methods

  async getLikeById(id: number): Promise<Likes> {
    const findLikes = await this.likeRepository.findOne({
      where: { id }
    })
    if (!findLikes) throw new BadRequestException('Likes with the provided ID does not exist')

    return findLikes
  }

  async findFromAllLike(id: number): Promise<Likes> {
    const findLikes = await this.likeRepository.findOne({
      where: { id }
    })
    if (!findLikes) throw new BadRequestException('Likes with the provided ID does not exist')

    return findLikes
  }

  // Resolver Query Methods

  // Resolver Mutation Methods

  async createPostLike(createLikeInput: CreateLikeInput, userId: string): Promise<SuccessResponse> {
    return this.manager.transaction(async transactionalManager => {
      const { postId, ...rest } = createLikeInput

      let post
      const customer = await this.customerService.getCustomerById(userId)

      if (postId) post = await this.postService.findFromAllPost(postId)

      try {
        await transactionalManager.save(Likes, {
          ...rest,
          post: post,
          customer: { id: customer.id },
          createdBy: userId
        })

        await this.updateTotalLikeCount(transactionalManager, post, 'increment', userId)
      } catch (error) {
        throw new BadRequestException('Failed to create like')
      }

      return { success: true, message: 'Like Created' }
    })
  }

  async updatePostLike(updateLikeInput: UpdateLikeInput, userId: string): Promise<SuccessResponse> {
    return this.manager.transaction(async transactionalManager => {
      const { postId, likeId, ...rest } = updateLikeInput

      const like = await this.getLikeById(likeId)

      let post
      const customer = await this.customerService.getCustomerById(userId)

      if (postId) post = await this.postService.findFromAllPost(postId)

      try {
        await transactionalManager.update(Likes, like.id, {
          ...rest,
          post: post,
          user: { id: customer.id },
          updatedBy: userId,
          updatedDate: new Date()
        })

        await this.updateTotalLikeCount(transactionalManager, post, 'decrement', userId)
      } catch (error) {
        throw new BadRequestException('Failed to update like')
      }

      return { success: true, message: 'Likes Updated' }
    })
  }
}
