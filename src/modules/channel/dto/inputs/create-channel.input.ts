import { InputType, Field, Int } from '@nestjs/graphql'

import { IsNotEmpty, IsString, MaxLength, IsOptional, IsUUID, IsNumber, Min } from 'class-validator'

import { ChannelStatus } from '@app/channel/channel.constants'

@InputType()
export class CreateChannelInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Channel title cannot be empty' })
  @IsString({ message: 'Channel title must be a string' })
  title!: string

  @Field(() => String)
  @IsNotEmpty({ message: 'Moderator id cannot be empty' })
  @IsUUID('4', { message: 'Invalid Moderator UUID format' })
  moderatorId!: string

  @Field(() => String, { nullable: true })
  @IsString({ message: 'Channel Rule name must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Channel Rule name cannot be longer than 500 characters' })
  rules?: string

  @Field(() => String, { nullable: true })
  @IsString({ message: 'Channel About name must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Channel About name cannot be longer than 500 characters' })
  about?: string

  @IsString({ message: 'image should be a string' })
  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(250, { message: 'image should not exceed 50 characters' })
  image?: string

  @IsString({ message: 'backgroundImage should be a string' })
  @IsOptional()
  @Field(() => String, { nullable: true })
  @MaxLength(250, { message: 'backgroundImage should not exceed 50 characters' })
  backgroundImage?: string

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsNumber({}, { message: 'Channel Price price must be a number' })
  @Min(0, { message: 'Minimum can not be negative' })
  @IsOptional()
  totalPrice!: number

  @Field(() => ChannelStatus, { defaultValue: ChannelStatus.PUBLIC })
  @IsOptional()
  status?: ChannelStatus
}
