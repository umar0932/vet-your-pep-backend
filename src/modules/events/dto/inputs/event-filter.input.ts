import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class EventFilterInputs {
  @Field(() => String, { nullable: true })
  search?: string
}
