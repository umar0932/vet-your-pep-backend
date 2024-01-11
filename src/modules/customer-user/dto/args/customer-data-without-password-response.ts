import { ObjectType, Field, ID } from '@nestjs/graphql'

@ObjectType()
export class CustomerWithoutPasswordResponse {
  @Field(() => ID, { nullable: true })
  id?: string

  @Field({ nullable: true })
  email?: string

  @Field({ nullable: true })
  firstName?: string

  @Field({ nullable: true })
  lastName?: string

  @Field({ nullable: true })
  cellPhone?: string

  @Field({ nullable: true })
  isActive?: boolean
}
