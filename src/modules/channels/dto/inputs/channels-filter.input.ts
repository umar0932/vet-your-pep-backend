import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class ChannelsFilterInput {
  @Field(() => String, { nullable: true })
  channelsTitle?: string

  @Field(() => String, { nullable: true })
  search?: string
}
