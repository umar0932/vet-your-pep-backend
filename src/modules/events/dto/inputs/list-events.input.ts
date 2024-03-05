import { Field, InputType } from '@nestjs/graphql'

import { IsOptional, IsUUID } from 'class-validator'

import { EventFilterInputs } from './event-filter.input'

@InputType()
export class ListEventsInput {
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  calenderEvents?: boolean

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid Channel UUID format' })
  channelId?: string

  @Field({ name: 'offset', nullable: true, defaultValue: 0 })
  offset: number

  @Field({ name: 'limit', nullable: false })
  limit: number

  @Field(() => EventFilterInputs, { nullable: true })
  filter?: EventFilterInputs
}
