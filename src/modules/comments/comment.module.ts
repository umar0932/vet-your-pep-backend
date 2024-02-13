import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AdminModule } from '@app/admin'
import { CustomerUserModule } from '@app/customer-user'

import { Comments } from './entities'
import { CommentResolver } from './comment.resolver'
import { CommentService } from './comment.service'
import { PostModule } from '@app/post'

@Module({
  imports: [TypeOrmModule.forFeature([Comments]), AdminModule, CustomerUserModule, PostModule],
  providers: [CommentResolver, CommentService],
  exports: [CommentService]
})
export class CommentModule {}
