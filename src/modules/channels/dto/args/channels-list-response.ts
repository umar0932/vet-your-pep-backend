import { Field, ObjectType } from '@nestjs/graphql'

import { Channel } from '@app/channels/entities'

@ObjectType()
export class ListChannelsResponse {
  @Field(() => [Channel])
  results: Channel[]

  @Field(() => Number, { nullable: true })
  totalRows?: number

  @Field({ nullable: true, defaultValue: 0 })
  offset: number

  @Field({ nullable: false })
  limit: number
}
