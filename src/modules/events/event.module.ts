import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AdminModule } from '@app/admin'
import { AwsS3ClientModule } from '@app/aws-s3-client'
import { ChannelsModule } from '@app/channel'
import { CustomerUserModule } from '@app/customer-user'

import { CalenderEvents, Events } from './entities'
import { EventResolver } from './event.resolver'
import { EventService } from './event.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Events, CalenderEvents]),
    AdminModule,
    AwsS3ClientModule,
    CustomerUserModule,
    ChannelsModule
  ],
  providers: [EventResolver, EventService],
  exports: [EventService]
})
export class EventModule {}
