import { InputType, Field, PickType, ID } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

import { CreatePostInput } from './create-post.input'

@InputType()
export class UpdatePostInput extends PickType(CreatePostInput, ['body', 'channelId', 'images']) {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Post ID cannot be empty' })
  @IsString({ message: 'Post ID name must be a string' })
  postId!: string

  //   @Field(() => Int, { nullable: true, defaultValue: 0 })
  //   @IsNumber({}, { message: 'Channel Price price must be a number' })
  //   @Min(0, { message: 'Minimum can not be negative' })
  //   @IsOptional()
  //   likeCount?: number
}
