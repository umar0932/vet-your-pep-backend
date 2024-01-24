import { InputType, Field, Int } from '@nestjs/graphql'

import { IsNotEmpty, IsString, MaxLength, IsOptional, IsUUID, IsNumber } from 'class-validator'

import { ChannelsStatus } from '@app/channels/channels.constants'

@InputType()
export class CreateChannelsInput {
  @Field()
  @IsNotEmpty({ message: 'Channels title cannot be empty' })
  @IsString({ message: 'Channels title must be a string' })
  channelsTitle!: string

  @Field(() => String)
  @IsNotEmpty({ message: 'Moderator id cannot be empty' })
  @IsUUID('4', { message: 'Invalid Moderator UUID format' })
  refIdModerator!: string

  @Field(() => String, { nullable: true })
  @IsString({ message: 'Channels Rule name must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Channels Rule name cannot be longer than 500 characters' })
  channelsRule: string

  @Field(() => String, { nullable: true })
  @IsString({ message: 'Channels About name must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Channels About name cannot be longer than 500 characters' })
  channelsAbout?: string

  @Field(() => Int, { nullable: true })
  @IsNumber({}, { message: 'Channel Price price must be a number' })
  @IsOptional()
  totalPrice!: number

  @Field(() => ChannelsStatus, { defaultValue: ChannelsStatus.PUBLIC })
  @IsOptional()
  channelStatus?: ChannelsStatus
}
