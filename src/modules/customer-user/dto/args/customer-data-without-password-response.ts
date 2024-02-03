import { ObjectType, Field, ID } from '@nestjs/graphql'

@ObjectType()
export class CustomerWithoutPasswordResponse {
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

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean
}
