import { Field, ObjectType } from '@nestjs/graphql'

import { Events } from '@app/events/entities'

@ObjectType()
export class ListEventsResponse {
  @Field(() => [Events])
  results: Events[]

  @Field(() => Number, { nullable: true })
  totalRows?: number

  @Field({ nullable: true, defaultValue: 0 })
  offset: number

  @Field({ nullable: false })
  limit: number
}
