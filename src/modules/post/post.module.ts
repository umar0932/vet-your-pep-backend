import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AdminModule } from '@app/admin'
import { AwsS3ClientModule } from '@app/aws-s3-client'
import { ChannelsModule } from '@app/channel'
import { CustomerUserModule } from '@app/customer-user'

import { Likes, Post } from './entities'
import { PostResolver } from './post.resolver'
import { PostService } from './post.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Likes]),
    AdminModule,
    AwsS3ClientModule,
    CustomerUserModule,
    ChannelsModule
  ],
  providers: [PostResolver, PostService],
  exports: [PostService]
})
export class PostModule {}
