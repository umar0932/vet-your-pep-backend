import { InputType, Field, PickType, ID } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

import { CreateChannelInput } from './create-channel.input'

@InputType()
export class UpdateChannelInput extends PickType(CreateChannelInput, [
  'channelTitle',
  'channelRules',
  'channelsAbout'
]) {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Channel ID cannot be empty' })
  @IsString({ message: 'Channel ID name must be a string' })
  idChannel!: string
}
