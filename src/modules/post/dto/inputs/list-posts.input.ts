import { Field, InputType } from '@nestjs/graphql'

import { PostFilterInputs } from './post-filter.input'

@InputType()
export class ListPostsInput {
  @Field({ name: 'offset', nullable: true, defaultValue: 0 })
  offset: number

  @Field({ name: 'limit', nullable: false })
  limit: number

  @Field(() => PostFilterInputs, { nullable: true })
  filter?: PostFilterInputs
}
