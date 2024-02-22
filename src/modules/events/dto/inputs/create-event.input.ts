import { InputType, Field } from '@nestjs/graphql'

import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsUUID,
  IsArray,
  IsDate
} from 'class-validator'

@InputType()
export class CreateEventInput {
  // Complusory Variables
  @Field(() => String)
  @IsNotEmpty({ message: 'Event text cannot be empty' })
  @IsString({ message: 'Event text must be a string' })
  @MaxLength(500, { message: 'Event text cannot be longer than 500 characters' })
  text!: string

  @Field()
  @IsNotEmpty({ message: 'Event title cannot be empty' })
  @IsString({ message: 'Event title must be a string' })
  @MaxLength(50, { message: 'Event title cannot be longer than 50 characters' })
  title!: string

  @Field(() => Date)
  @IsNotEmpty({ message: 'Start date cannot be empty' })
  @IsDate({ message: 'Invalid start date date format' })
  startDate!: Date

  // Relations

  @Field(() => String)
  @IsNotEmpty({ message: 'Channel id cannot be empty' })
  @IsUUID('4', { message: 'Invalid Channel UUID format' })
  channelId!: string

  // Non Complusory Variables

  @Field(() => [String], { nullable: true })
  @IsArray({ message: 'Event Images must be an array' })
  @IsOptional()
  images?: string[]
}
