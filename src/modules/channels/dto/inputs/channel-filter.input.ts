import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class ChannelFilterInputs {
  @Field(() => String, { nullable: true })
  channelTitle?: string

  @Field(() => String, { nullable: true })
  search?: string
}
