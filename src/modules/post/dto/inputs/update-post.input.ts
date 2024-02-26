import { InputType, Field, PickType, ID } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

import { CreatePostInput } from './create-post.input'

@InputType()
export class UpdatePostInput extends PickType(CreatePostInput, ['body', 'channelId', 'images']) {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Post ID cannot be empty' })
  @IsString({ message: 'Post ID name must be a string' })
  postId!: string
}
