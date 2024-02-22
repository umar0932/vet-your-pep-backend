import { InputType, Field, PickType, ID } from '@nestjs/graphql'

import { IsNotEmpty, IsString } from 'class-validator'

import { CreatePlatFormRulesInput } from './create-platform-rules'

@InputType()
export class UpdatePlatFormRulesInput extends PickType(CreatePlatFormRulesInput, [
  'title',
  'rules'
]) {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Platform Rules ID cannot be empty' })
  @IsString({ message: 'Platform Rule ID must be a string' })
  platFormRulesId!: string
}
