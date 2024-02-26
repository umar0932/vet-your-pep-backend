import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AdminModule } from '@app/admin'
import { CustomerUserModule } from '@app/customer-user'

import { Likes } from './entities'
import { LikeResolver } from './like.resolver'
import { LikeService } from './like.service'
import { PostModule } from '@app/post'

@Module({
  imports: [TypeOrmModule.forFeature([Likes]), AdminModule, CustomerUserModule, PostModule],
  providers: [LikeResolver, LikeService],
  exports: [LikeService]
})
export class LikeModule {}
