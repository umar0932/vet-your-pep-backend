import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'

import { Brackets, EntityManager, Repository } from 'typeorm'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { uuid } from 'uuidv4'

import { AdminService } from '@app/admin'
import { AwsS3ClientService } from '@app/aws-s3-client'
import { ChannelService } from '@app/channel'
import { CustomerUserService } from '@app/customer-user'
import { JWT_STRATEGY_NAME, JwtUserPayload, SuccessResponse } from '@app/common'
import { S3SignedUrlResponse } from '@app/aws-s3-client/dto/args'

import { CreatePostInput, ListPostsInput, UpdatePostInput } from './dto/inputs'
import { Post } from './entities'

@Injectable()
export class PostService {
  constructor(
    private adminService: AdminService,
    private configService: ConfigService,
    private channelService: ChannelService,
    private customerService: CustomerUserService,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectEntityManager() private readonly manager: EntityManager,
    private s3Service: AwsS3ClientService
  ) {}

  // Private Methods

  // Public Methods

  async getPostById(id: string, userId: string): Promise<Post> {
    const findPosts = await this.postRepository.findOne({
      where: { id, createdBy: userId }
    })
    if (!findPosts) throw new BadRequestException('Post with the provided ID does not exist')

    return findPosts
  }

  async findFromAllPost(id: string): Promise<Post> {
    const findPosts = await this.postRepository.findOne({
      where: { id }
    })
    if (!findPosts) throw new BadRequestException('Post with the provided ID does not exist')

    return findPosts
  }

  // Resolver Query Methods

  async getPostUploadUrls(count: number): Promise<S3SignedUrlResponse[]> {
    if (!count) throw new BadRequestException('Count cannot be less than 1')
    const urls: S3SignedUrlResponse[] = []

    for (let i = 0; i < count; i++) {
      const key = `user_post_image_uploads/${uuid()}-post-upload`
      const bucketName = this.configService.get('USER_UPLOADS_BUCKET')

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key
      })
      const url = await getSignedUrl(this.s3Service.getClient(), command, {
        expiresIn: 3600
      })
      urls.push({
        signedUrl: url,
        fileName: key
      })
    }

    return urls
  }

  async getPostsWithPagination(
    listPostsInput: ListPostsInput,
    user: JwtUserPayload
  ): Promise<[Post[], number, number, number]> {
    const { limit, offset, filter, customerId, userFeed, channelId } = listPostsInput
    const { search } = filter || {}
    const { userId, type } = user || {}

    try {
      const queryBuilder = this.postRepository.createQueryBuilder('posts')

      if (search) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(posts.body) LIKE LOWER(:search)', { search: `%${search}%` })
          })
        )
      }

      queryBuilder
        .leftJoinAndSelect('posts.likes', 'likes')
        .leftJoinAndSelect('posts.customer', 'customer')
        .leftJoinAndSelect('posts.comments', 'comments')
        .leftJoinAndSelect('comments.user', 'userComments')
        .leftJoinAndSelect('likes.user', 'userlikes')
        .leftJoinAndSelect('posts.channel', 'channel')
        .orderBy('posts.createdDate', 'DESC')
        .take(limit)
        .skip(offset)

      if (channelId) {
        queryBuilder.andWhere('channel.id = :channelId', { channelId })
      } else if (type === JWT_STRATEGY_NAME.CUSTOMER) {
        if (userFeed) {
          queryBuilder.innerJoin('channel.members', 'cm', 'cm.customer.id = :userId', { userId })
        } else if (customerId) {
          const channelQueryBuilder = await this.channelService.channelQuerBuilder()
          const commonChannelsSubQuery = channelQueryBuilder
            .innerJoin('channels.members', 'cm1')
            .innerJoin(
              'channels.members',
              'cm2',
              'cm1.customer.id = :userId AND cm2.customer.id = :customerId',
              { userId, customerId }
            )
            .select('channels.id')

          queryBuilder
            .innerJoin('posts.channel', 'postChannel')
            .innerJoin('posts.customer', 'user', 'user.id = :customerId', {
              customerId
            })
            .andWhere('postChannel.id IN (' + commonChannelsSubQuery.getQuery() + ')')
            .setParameters(commonChannelsSubQuery.getParameters())
        } else {
          queryBuilder.where('customer.id = :userId', { userId })
        }
      }

      const [posts, total] = await queryBuilder.getManyAndCount()

      return [posts, total, limit, offset]
    } catch (error) {
      throw new BadRequestException('Failed to find Post')
    }
  }

  // Resolver Mutation Methods

  async createPost(createPostInput: CreatePostInput, userId: string): Promise<SuccessResponse> {
    const { channelId, ...rest } = createPostInput

    const checkChannelMemberExist = await this.channelService.checkChannelMemberByIdExist(
      channelId,
      userId
    )

    if (!checkChannelMemberExist) throw new BadRequestException('Only channel members can post')

    try {
      await this.postRepository.save({
        ...rest,
        channel: { id: channelId },
        customer: { id: userId },
        createdBy: userId
      })
    } catch (error) {
      throw new BadRequestException('Failed to create post')
    }

    return { success: true, message: 'Post Created' }
  }

  async updatePost(updatePostInput: UpdatePostInput, userId: string): Promise<SuccessResponse> {
    const { channelId, postId, ...rest } = updatePostInput

    const post = await this.getPostById(postId, userId)

    const channel = await this.channelService.getChannelById(channelId)

    const checkChannelMemberExist = await this.channelService.checkChannelMemberByIdExist(
      channel.id,
      userId
    )
    if (!checkChannelMemberExist) throw new BadRequestException('Only channel members can post')

    try {
      await this.postRepository.update(post.id, {
        ...rest,
        channel: channel,
        customer: { id: userId },
        updatedBy: userId,
        updatedDate: new Date()
      })
    } catch (error) {
      throw new BadRequestException('Failed to update post')
    }

    return { success: true, message: 'Post Updated' }
  }
}
