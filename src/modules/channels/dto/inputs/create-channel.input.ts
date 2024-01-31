import { InputType, Field, Int } from '@nestjs/graphql'

import { IsNotEmpty, IsString, MaxLength, IsOptional, IsUUID, IsNumber, Min } from 'class-validator'

import { ChannelStatus } from '@app/channels/channel.constants'

@InputType()
export class CreateChannelInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Channel title cannot be empty' })
  @IsString({ message: 'Channel title must be a string' })
  channelTitle!: string

  @Field(() => String)
  @IsNotEmpty({ message: 'Moderator id cannot be empty' })
  @IsUUID('4', { message: 'Invalid Moderator UUID format' })
  refIdModerator!: string

  @Field(() => String, { nullable: true })
  @IsString({ message: 'Channel Rule name must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Channel Rule name cannot be longer than 500 characters' })
  channelRules: string

  @Field(() => String, { nullable: true })
  @IsString({ message: 'Channel About name must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Channel About name cannot be longer than 500 characters' })
  channelsAbout?: string

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsNumber({}, { message: 'Channel Price price must be a number' })
  @Min(0, { message: 'Minimum can not be negative' })
  @IsOptional()
  totalPrice!: number

  @Field(() => ChannelStatus, { defaultValue: ChannelStatus.PUBLIC })
  @IsOptional()
  channelStatus?: ChannelStatus
}
