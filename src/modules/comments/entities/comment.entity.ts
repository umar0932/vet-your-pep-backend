import { ObjectType, Field, ID } from '@nestjs/graphql'

import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { CustomBaseEntity } from '@app/common/entities/base.entity'
import { Customer } from '@app/customer-user/entities'
import { Post } from '@app/post/entities'

@Entity({ name: 'comments' })
@ObjectType()
export class Comments extends CustomBaseEntity {
  // Primary key
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string

  // Complusory Variables

  @Column({ type: 'text', default: '' })
  @Field(() => String)
  content!: string

  // Non Complusory Variables

  // Relations

  @Field(() => Customer)
  @ManyToOne(() => Customer, customer => customer.comments, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'user_id' })
  user: Customer

  @Field(() => Post)
  @ManyToOne(() => Post, post => post.comments, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'post_id' })
  post: Post
}
