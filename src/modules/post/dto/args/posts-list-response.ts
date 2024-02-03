import { Field, ObjectType } from '@nestjs/graphql'

import { Post } from '@app/post/entities'

@ObjectType()
export class ListPostsResponse {
  @Field(() => [Post])
  results: Post[]

  @Field(() => Number, { nullable: true })
  totalRows?: number

  @Field({ nullable: true, defaultValue: 0 })
  offset: number

  @Field({ nullable: false })
  limit: number
}
