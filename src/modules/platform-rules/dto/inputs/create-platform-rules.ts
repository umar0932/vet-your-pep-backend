import { InputType, Field } from '@nestjs/graphql'

import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator'

@InputType()
export class CreatePlatFormRulesInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Platform Rules title cannot be empty' })
  @IsString({ message: 'Platform Rules title must be a string' })
  title!: string

  @Field(() => String, { nullable: true })
  @IsString({ message: 'Platform rules must be a string' })
  @IsOptional()
  @MaxLength(1000, { message: 'Platform rules cannot be longer than 500 characters' })
  rules?: string
}
