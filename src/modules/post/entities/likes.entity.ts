import { ObjectType, Field, ID } from '@nestjs/graphql'

import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { CustomBaseEntity } from '@app/common/entities/base.entity'
import { Customer } from '@app/customer-user/entities'
import { Post } from './post.entity'

@Entity({ name: 'likes' })
@ObjectType()
export class Likes extends CustomBaseEntity {
  // Primary key
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number

  // Relations

  @Field(() => String)
  @ManyToOne(() => Customer, (user: Customer) => user.likes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'user_id' })
  user: Customer

  @ManyToOne(() => Post, (post: Post) => post.likes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'post_id' })
  post: Post
}
