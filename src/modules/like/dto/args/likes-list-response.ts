import { Field, ObjectType } from '@nestjs/graphql'

import { Likes } from '@app/like/entities'

@ObjectType()
export class ListLikesResponse {
  @Field(() => [Likes])
  results: Likes[]

  @Field(() => Number, { nullable: true })
  totalRows?: number

  @Field(() => Number, { nullable: true })
  offset?: number

  @Field(() => Number, { nullable: true })
  limit?: number
}
