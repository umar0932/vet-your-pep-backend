import { Field, InputType } from '@nestjs/graphql'

import { ChannelsFilterInput } from './channels-filter.input'

@InputType()
export class ListChannelsInputs {
  @Field({ name: 'offset', nullable: true, defaultValue: 0 })
  offset: number

  @Field({ name: 'limit', nullable: false })
  limit: number

  @Field(() => ChannelsFilterInput, { nullable: true })
  filter?: ChannelsFilterInput
}
