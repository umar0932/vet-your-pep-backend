import { Field, ObjectType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@ObjectType()
export class S3FileNameInput {
  @IsString({ message: 'Key must be a string' })
  @Field(() => String)
  key!: string
}
