import { InputType, Field } from '@nestjs/graphql'

import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator'

@InputType()
export class CreateCommentInput {
  // Complusory Variables
  @Field(() => String)
  @IsNotEmpty({ message: 'Comments body cannot be empty' })
  @IsString({ message: 'Comments body must be a string' })
  @MinLength(1, { message: 'Comments body minimum Length should be 1' })
  content!: string

  // Relations

  @Field(() => String)
  @IsNotEmpty({ message: 'Post id cannot be empty' })
  @IsUUID('4', { message: 'Invalid Post UUID format' })
  postId!: string

  // Non Complusory Variables
}
