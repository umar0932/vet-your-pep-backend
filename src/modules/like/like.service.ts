import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'

import { EntityManager, Repository } from 'typeorm'

import { CustomerUserService } from '@app/customer-user'
import { Post } from '@app/post/entities'
import { PostService } from '@app/post'

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

  async getLikeById(id: string): Promise<Likes> {
    const findLikes = await this.likeRepository.findOne({
      where: { id }
    })
    if (!findLikes) throw new BadRequestException('Likes with the provided ID does not exist')

    return findLikes
  }

  async findFromAllLike(id: string): Promise<Likes> {
    const findLikes = await this.likeRepository.findOne({
      where: { id }
    })
    if (!findLikes) throw new BadRequestException('Likes with the provided ID does not exist')

    return findLikes
  }

  // Resolver Query Methods

  // Resolver Mutation Methods

  async likePost(createLikeInput: CreateLikeInput, userId: string): Promise<Partial<Likes>> {
    return this.manager.transaction(async transactionalManager => {
      const { postId, ...rest } = createLikeInput

      const post = await this.postService.findFromAllPost(postId)

      const alreadyLiked = post.likes?.some(like => like.user.id === userId)
      if (alreadyLiked) throw new BadRequestException('User has already liked this post')

      try {
        const likes = await transactionalManager.save(Likes, {
          ...rest,
          post: post,
          user: { id: userId },
          createdBy: userId
        })

        await this.updateTotalLikeCount(transactionalManager, post, 'increment', userId)

        return likes
      } catch (error) {
        throw new BadRequestException('Failed to create like')
      }
    })
  }

  async unlikePost(updateLikeInput: UpdateLikeInput, userId: string): Promise<Partial<Likes>> {
    return this.manager.transaction(async transactionalManager => {
      const { postId } = updateLikeInput

      const post = await this.postService.findFromAllPost(postId)

      // Check if the user has liked the post
      const existingLike = await transactionalManager.findOne(Likes, {
        where: {
          user: { id: userId },
          post: { id: postId }
        }
      })

      if (!existingLike) throw new BadRequestException('User has not liked this post')

      try {
        await transactionalManager.remove(existingLike)

        await this.updateTotalLikeCount(transactionalManager, post, 'decrement', userId)

        return await this.getLikeById(existingLike.id)
      } catch (error) {
        throw new BadRequestException('Failed to update like')
      }
    })
  }
}
