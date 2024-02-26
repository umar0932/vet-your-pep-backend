import { InputType, Field, PickType, ID } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

import { CreateCommentInput } from './create-comment.input'

@InputType()
export class UpdateCommentInput extends PickType(CreateCommentInput, ['content', 'postId']) {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Comments ID cannot be empty' })
  @IsString({ message: 'Comments ID must be a string' })
  commentId!: string
}
