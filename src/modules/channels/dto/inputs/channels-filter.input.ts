import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class ChannelsFilterInput {
  @Field({ nullable: true })
  channelsTitle?: string

  @Field({ nullable: true })
  search?: string
}
