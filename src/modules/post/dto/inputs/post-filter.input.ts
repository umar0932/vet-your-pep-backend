import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class PostFilterInputs {
  @Field(() => String, { nullable: true })
  search?: string
}
