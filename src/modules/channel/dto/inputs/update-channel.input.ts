import { InputType, Field, PickType, ID } from '@nestjs/graphql'

import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

import { CreateChannelInput } from './create-channel.input'

@InputType()
export class UpdateChannelInput extends PickType(CreateChannelInput, [
  'rules',
  'about',
  'image',
  'backgroundImage'
]) {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Channel ID cannot be empty' })
  @IsString({ message: 'Channel ID name must be a string' })
  id!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Channel title must be a string' })
  title?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid Moderator UUID format' })
  moderatorId?: string
}
