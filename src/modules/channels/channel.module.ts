import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AdminModule } from '@app/admin'
import { AwsS3ClientModule } from '@app/aws-s3-client'
import { CustomerUserModule } from '@app/customer-user'

import { ChannelMember, Channel } from './entities'
import { ChannelResolver } from './channel.resolver'
import { ChannelService } from './channel.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, ChannelMember]),
    AdminModule,
    AwsS3ClientModule,
    CustomerUserModule
  ],
  providers: [ChannelResolver, ChannelService],
  exports: [ChannelService]
})
export class ChannelsModule {}
