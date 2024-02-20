import { Field, InputType } from '@nestjs/graphql'

import { PlatFormRulesFilterInputs } from './platform-rules-filter.input'

@InputType()
export class ListPlatFormRulesInput {
  @Field({ name: 'offset', nullable: true, defaultValue: 0 })
  offset: number

  @Field({ name: 'limit', nullable: false })
  limit: number

  @Field(() => PlatFormRulesFilterInputs, { nullable: true })
  filter?: PlatFormRulesFilterInputs
}
