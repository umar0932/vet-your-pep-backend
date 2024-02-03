import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'

import { EntityManager, Repository } from 'typeorm'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { uuid } from 'uuidv4'

import { AdminService } from '@app/admin'
import { SuccessResponse } from '@app/common'
import { AwsS3ClientService } from '@app/aws-s3-client'
import { ChannelService } from '@app/channel'
import { CustomerUserService } from '@app/customer-user'
import { S3SignedUrlResponse } from '@app/aws-s3-client/dto/args'

import { Post } from './entities'
import { CreatePostInput } from './dto/inputs'

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
  async getPostById(id: number): Promise<Post> {
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

  // Resolver Mutation Methods

  async createPost(createPostInput: CreatePostInput, userId: string): Promise<SuccessResponse> {
    const { channelId, customerId, ...rest } = createPostInput

    let customer, channel
    if (customerId) customer = await this.customerService.getCustomerById(customerId)

    if (channelId) channel = await this.channelService.getChannelById(channelId)

    try {
      await this.postRepository.save({
        ...rest,
        channel: channel,
        customer: { id: customer.id },
        createdBy: userId
      })
    } catch (error) {
      throw new BadRequestException('Failed to create post')
    }

    return { success: true, message: 'Post Created' }
  }
}
