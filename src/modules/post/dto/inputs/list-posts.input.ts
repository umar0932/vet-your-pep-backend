import { Field, InputType } from '@nestjs/graphql'

import { IsOptional, IsUUID } from 'class-validator'

import { PostFilterInputs } from './post-filter.input'

@InputType()
export class ListPostsInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid Channel UUID format' })
  channelId?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid Customer UUID format' })
  customerId?: string

  @Field(() => PostFilterInputs, { nullable: true })
  @IsOptional()
  filter?: PostFilterInputs

  @Field({ name: 'limit', nullable: false })
  limit: number

  @Field({ name: 'offset', nullable: true, defaultValue: 0 })
  offset: number

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  userFeed?: boolean
}
