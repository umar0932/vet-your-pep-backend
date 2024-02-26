import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class CommentsFilterInputs {
  @Field(() => String, { nullable: true })
  search?: string
}
