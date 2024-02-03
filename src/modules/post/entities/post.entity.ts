import { ObjectType, Field, ID, Int } from '@nestjs/graphql'

import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { CustomBaseEntity } from '@app/common/entities/base.entity'
import { Customer } from '@app/customer-user/entities'
import { Channel } from '@app/channel/entities'
import { Likes } from './likes.entity'

@Entity({ name: 'posts' })
@ObjectType()
export class Post extends CustomBaseEntity {
  // Primary key
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number

  // Complusory Variables

  @Column({ type: 'text', default: '' })
  @Field(() => String)
  body!: string

  // Non Complusory Variables

  @Column({ type: 'simple-array', nullable: true })
  @Field(() => [String], { nullable: true })
  images?: string[]

  @Column({ type: 'bigint', name: 'like_count', default: 0 })
  @Field(() => Int, { nullable: true })
  likeCount?: number

  // Relations

  @Field(() => Channel, { nullable: true })
  @ManyToOne(() => Channel, channel => channel.posts, { nullable: true })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel

  @Field(() => Customer)
  @ManyToOne(() => Customer, customer => customer.posts)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer

  @Field(() => [Likes], { nullable: true })
  @OneToMany(() => Likes, (like: Likes) => like.post, {
    eager: true,
    nullable: true,
    cascade: true
  })
  likes: Likes[]

  // @Field(() => [Comment], { nullable: true })
  // @OneToMany(() => Comment, comment => comment.post, { eager: true, nullable: true, cascade: true })
  // comments: Comment[]
}
