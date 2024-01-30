import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AdminModule } from '@app/admin'
import { AwsS3ClientModule } from '@app/aws-s3-client'
import { CustomerUserModule } from '@app/customer-user'

import { ChannelMember, Channels } from './entities'
import { ChannelsResolver } from './channels.resolver'
import { ChannelsService } from './channels.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Channels, ChannelMember]),
    AdminModule,
    AwsS3ClientModule,
    CustomerUserModule
  ],
  providers: [ChannelsResolver, ChannelsService],
  exports: [ChannelsService]
})
export class ChannelsModule {}
