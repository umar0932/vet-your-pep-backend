import { InputType, Field } from '@nestjs/graphql'

import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator'

@InputType()
export class UpdateCustomerInput {
  @IsString({ message: 'First name should be a string' })
  @IsOptional()
  @Field(() => String, { nullable: true })
  firstName?: string

  @IsString({ message: 'Last name should be a string' })
  @IsOptional()
  @Field(() => String, { nullable: true })
  lastName?: string

  @IsOptional()
  @Field(() => String, { nullable: true })
  cellPhone?: string

  @IsString({ message: 'MediaUrl should be a string' })
  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(250, { message: 'MediaUrl should not exceed 50 characters' })
  mediaUrl?: string

  @IsString({ message: 'Stripe Customer ID should be a string' })
  @IsOptional()
  @Field(() => String, { nullable: true })
  stripeCustomerId?: string

  @IsBoolean({ message: 'isActive should be a boolean value' })
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean
}
