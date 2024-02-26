import { Field, ObjectType } from '@nestjs/graphql'

import { Events } from '@app/events/entities'

@ObjectType()
export class PartialEventResponse {
  @Field(() => [Events])
  results: Partial<Events[]>
}
