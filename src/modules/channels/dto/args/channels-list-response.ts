import { Field, ObjectType } from '@nestjs/graphql'

import { Channels } from '@app/channels/entities'
import { RelayTypes } from '@app/common'

@ObjectType()
export class ChannelsResponse extends RelayTypes<Channels>(Channels) {}

@ObjectType()
export class ListChannelsResponse {
  @Field(() => [Channels])
  results: Channels[]

  @Field(() => Number, { nullable: true })
  totalRows?: number
}
