import { InputType, Field, PickType, ID } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

import { CreateEventInput } from './create-event.input'

@InputType()
export class UpdateEventInput extends PickType(CreateEventInput, [
  'title',
  'text',
  'channelId',
  'images'
]) {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Event ID cannot be empty' })
  @IsString({ message: 'Event ID must be a string' })
  eventId!: string
}
