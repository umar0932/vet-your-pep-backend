import { Field, InputType } from '@nestjs/graphql'

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

@InputType()
export class ForgotPasswordInput {
  @Field(() => String)
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email!: string

  @Field(() => String)
  @IsString({ message: 'Origin must be a string' })
  @IsOptional()
  origin?: string
}
