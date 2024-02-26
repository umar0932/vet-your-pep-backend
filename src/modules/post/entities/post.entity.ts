import { ObjectType, Field, ID, Int } from '@nestjs/graphql'

import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { Channel } from '@app/channel/entities'
import { Comments } from '@app/comments/entities'
import { CustomBaseEntity } from '@app/common/entities/base.entity'
import { Customer } from '@app/customer-user/entities'
import { Likes } from '@app/like/entities'

@Entity({ name: 'posts' })
@ObjectType()
export class Post extends CustomBaseEntity {
  // Primary key
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string

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

  @Field(() => Channel)
  @ManyToOne(() => Channel, channel => channel.posts, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel

  @Field(() => Customer)
  @ManyToOne(() => Customer, customer => customer.posts, {
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer

  @Field(() => [Likes], { nullable: true })
  @OneToMany(() => Likes, (like: Likes) => like.post, {
    eager: true,
    nullable: true
  })
  likes?: Likes[]

  @Field(() => [Comments], { nullable: true })
  @OneToMany(() => Comments, (comment: Comments) => comment.post, {
    eager: true,
    nullable: true
  })
  comments?: Comments[]
}
