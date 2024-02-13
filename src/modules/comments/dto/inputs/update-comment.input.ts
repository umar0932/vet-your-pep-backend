import { InputType, Field, PickType, ID } from '@nestjs/graphql'
import { IsNotEmpty, IsNumber } from 'class-validator'

import { CreateCommentInput } from './create-comment.input'

@InputType()
export class UpdateCommentInput extends PickType(CreateCommentInput, ['content', 'postId']) {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Comments ID cannot be empty' })
  @IsNumber({}, { message: 'Channel Price price must be a number' })
  commentId!: number
}
