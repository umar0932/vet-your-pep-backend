import { Field, ObjectType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@ObjectType()
export class S3SignedUrlResponse {
  @IsString({ message: 'SignedUrl must be a string' })
  @Field(() => String)
  signedUrl!: string

  @IsString({ message: 'FileName must be a string' })
  @Field(() => String)
  fileName!: string
}
