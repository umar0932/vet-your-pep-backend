import { Field, InputType } from '@nestjs/graphql'

import { EventFilterInputs } from './event-filter.input'

@InputType()
export class ListEventsInput {
  @Field({ name: 'offset', nullable: true, defaultValue: 0 })
  offset: number

  @Field({ name: 'limit', nullable: false })
  limit: number

  @Field(() => EventFilterInputs, { nullable: true })
  filter?: EventFilterInputs
}
