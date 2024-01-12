import { InputType, Field, PickType, ID } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

import { CreateChannelsInput } from './create-channels.input'

@InputType()
export class UpdateChannelsInput extends PickType(CreateChannelsInput, [
  'channelsTitle',
  'channelsRule',
  'channelsAbout'
]) {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Channels ID cannot be empty' })
  @IsString({ message: 'Channels ID name must be a string' })
  idChannel!: string
}
