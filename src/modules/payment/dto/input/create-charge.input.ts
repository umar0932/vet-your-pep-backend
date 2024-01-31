import { Field, InputType, Int } from '@nestjs/graphql'

import { IsString, IsNotEmpty, IsNumber } from 'class-validator'

@InputType()
export class CreateChargeInput {
  @IsString({ message: 'Payment Method Id must be a string' })
  @IsNotEmpty({ message: 'Payment Method Id cannot be empty' })
  @Field(() => String)
  paymentMethodId: string

  @IsNumber({}, { message: 'Amount must be a number' })
  @Field(() => Int)
  amount: number

  @IsString({ message: 'Customer Id must be a string' })
  @IsNotEmpty({ message: 'Customer Id cannot be empty' })
  @Field(() => String)
  customerId: string
}

export default CreateChargeInput
