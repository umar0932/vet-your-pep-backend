import { InputType, Field, PickType, ID } from '@nestjs/graphql'

import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

import { CreatePlatFormRulesInput } from './create-platform-rules'

@InputType()
export class UpdatePlatFormRulesInput extends PickType(CreatePlatFormRulesInput, ['rules']) {
  // Complusory Variables
  @Field(() => ID)
  @IsNotEmpty({ message: 'Platform Rules ID cannot be empty' })
  @IsString({ message: 'Platform Rule ID must be a string' })
  platFormRulesId!: string

  // Non Complusory Variables

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Platform Rules title must be a string' })
  title?: string
}
