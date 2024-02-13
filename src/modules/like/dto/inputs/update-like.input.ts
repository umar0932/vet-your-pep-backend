import { InputType, Field, PickType, ID } from '@nestjs/graphql'
import { IsNotEmpty, IsNumber } from 'class-validator'

import { CreateLikeInput } from './create-like.input'

@InputType()
export class UpdateLikeInput extends PickType(CreateLikeInput, ['postId']) {
  @Field(() => ID)
  @IsNotEmpty({ message: 'like ID cannot be empty' })
  @IsNumber({}, { message: 'Channel Price price must be a number' })
  likeId!: number
}
