import { InputType, Field, PickType, ID } from '@nestjs/graphql'
import { IsDate, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

import { CreateEventInput } from './create-event.input'

@InputType()
export class UpdateEventInput extends PickType(CreateEventInput, ['channelId', 'images']) {
  // Complusory Variables
  @Field(() => ID)
  @IsNotEmpty({ message: 'Event ID cannot be empty' })
  @IsString({ message: 'Event ID must be a string' })
  eventId!: string

  // Non Complusory Variables

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Event text must be a string' })
  @MaxLength(500, { message: 'Event text cannot be longer than 500 characters' })
  text?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Event title must be a string' })
  @MaxLength(50, { message: 'Event title cannot be longer than 50 characters' })
  title?: string

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate({ message: 'Invalid startDate date format' })
  startDate?: Date
}
