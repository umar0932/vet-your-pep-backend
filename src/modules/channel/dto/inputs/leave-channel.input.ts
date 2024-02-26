import { InputType, Field } from '@nestjs/graphql'

import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator'

@InputType()
export class LeaveChannelInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Channel id cannot be empty' })
  @IsUUID('4', { message: 'Invalid Channel UUID format' })
  channelId!: string

  @Field(() => String)
  @IsOptional()
  @IsUUID('4', { message: 'Invalid Customer UUID format' })
  customerId?: string
}
