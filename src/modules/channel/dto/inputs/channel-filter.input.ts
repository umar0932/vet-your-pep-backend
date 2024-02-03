import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class ChannelFilterInputs {
  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  search?: string
}
