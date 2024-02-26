import { Field, ObjectType } from '@nestjs/graphql'

import { PlatFormRules } from '@app/platform-rules/entities'

@ObjectType()
export class ListPlatFormRulesResponse {
  @Field(() => [PlatFormRules])
  results?: PlatFormRules[]

  @Field(() => Number, { nullable: true })
  totalRows?: number

  @Field({ nullable: true, defaultValue: 0 })
  offset: number

  @Field({ nullable: false })
  limit: number
}
