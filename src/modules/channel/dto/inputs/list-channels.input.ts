import { Field, InputType } from '@nestjs/graphql'

import { ChannelFilterInputs } from './channel-filter.input'

@InputType()
export class ListChannelsInput {
  @Field({ name: 'offset', nullable: true, defaultValue: 0 })
  offset: number

  @Field({ name: 'limit', nullable: false })
  limit: number

  @Field(() => ChannelFilterInputs, { nullable: true })
  filter?: ChannelFilterInputs

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  joined?: boolean
}
