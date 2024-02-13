import { InputType, Field } from '@nestjs/graphql'

import { IsNotEmpty, IsString, MaxLength, IsOptional, IsUUID, IsArray } from 'class-validator'

@InputType()
export class CreatePostInput {
  // Complusory Variables
  @Field(() => String)
  @IsNotEmpty({ message: 'Post body cannot be empty' })
  @IsString({ message: 'Post body must be a string' })
  @MaxLength(500, { message: 'Post body cannot be longer than 500 characters' })
  body!: string

  // Relations

  @Field(() => String)
  @IsNotEmpty({ message: 'Channel id cannot be empty' })
  @IsUUID('4', { message: 'Invalid Channel UUID format' })
  channelId!: string

  // Non Complusory Variables

  @Field(() => [String], { nullable: true })
  @IsArray({ message: 'Post Images must be an array' })
  @IsOptional()
  images?: string[]
}
