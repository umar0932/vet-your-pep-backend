import { InputType, Field } from '@nestjs/graphql'

import { IsOptional, IsString } from 'class-validator'

@InputType()
export class PlatFormRulesFilterInputs {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Platform Rules title must be a string' })
  title?: string

  @Field(() => String, { nullable: true })
  search?: string
}
