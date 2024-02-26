import { InputType, Field } from '@nestjs/graphql'

import { IsNotEmpty, IsUUID } from 'class-validator'

@InputType()
export class CreateLikeInput {
  // Complusory Variables

  // Relations

  @Field(() => String)
  @IsNotEmpty({ message: 'Post id cannot be empty' })
  @IsUUID('4', { message: 'Invalid Post UUID format' })
  postId!: string

  // Non Complusory Variables
}
