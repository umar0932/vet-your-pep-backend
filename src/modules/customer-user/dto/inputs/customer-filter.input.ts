import { InputType, Field, ID } from '@nestjs/graphql'

@InputType()
export class CustomerFilterInput {
  @Field(() => ID, { nullable: true })
  id?: string

  @Field(() => String, { nullable: true })
  email?: string

  @Field(() => String, { nullable: true })
  firstName?: string

  @Field(() => String, { nullable: true })
  lastName?: string

  @Field(() => String, { nullable: true })
  cellPhone?: string

  @Field(() => String, { nullable: true })
  search?: string
}
