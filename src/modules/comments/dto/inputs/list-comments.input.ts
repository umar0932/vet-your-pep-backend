import { Field, InputType } from '@nestjs/graphql'

import { CommentsFilterInputs } from './comments-filter.input'

@InputType()
export class ListCommentsInput {
  @Field({ name: 'offset', nullable: true, defaultValue: 0 })
  offset: number

  @Field({ name: 'limit', nullable: false })
  limit: number

  @Field(() => CommentsFilterInputs, { nullable: true })
  filter?: CommentsFilterInputs
}
