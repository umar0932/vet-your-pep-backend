import { InputType, Field, PickType, ID } from '@nestjs/graphql'
import { IsNotEmpty, IsNumber } from 'class-validator'

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
  @IsNumber({}, { message: 'Channel Price price must be a number' })
  eventId!: number
}
