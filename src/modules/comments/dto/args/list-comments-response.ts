import { Field, ObjectType } from '@nestjs/graphql'

import { Comments } from '@app/comments/entities'

@ObjectType()
export class ListCommentsResponse {
  @Field(() => [Comments])
  results: Comments[]

  @Field(() => Number, { nullable: true })
  totalRows?: number

  @Field({ nullable: true, defaultValue: 0 })
  offset?: number

  @Field({ nullable: false })
  limit?: number
}
