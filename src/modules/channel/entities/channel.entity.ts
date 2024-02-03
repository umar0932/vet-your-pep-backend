import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql'

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { CustomBaseEntity } from '@app/common/entities/base.entity'

import { ChannelStatus } from '../channel.constants'
import { ChannelMember } from './channel-member.entity'
import { Post } from '@app/post/entities'
import { Customer } from '@app/customer-user/entities'

registerEnumType(ChannelStatus, {
  name: 'ChannelStatus',
  description: 'The status of channels'
})

@Entity({ name: 'channels' })
@ObjectType()
export class Channel extends CustomBaseEntity {
  // Primary key
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string

  // Complusory Variables

  @Column({ length: 50, unique: true })
  @Field(() => String)
  title!: string

  @Column({ default: false, name: 'is_paid' })
  @Field(() => Boolean)
  isPaid!: boolean

  @Column({ type: 'uuid', name: 'moderator_id' })
  @Field(() => String)
  moderatorId!: string

  @Field(() => Customer)
  moderator!: Customer

  // Non Complusory Variables

  @Column({ length: 250, name: 'background_image', nullable: true })
  @Field(() => String, { nullable: true })
  backgroundImage?: string

  @Column({ length: 250, name: 'image', nullable: true })
  @Field(() => String, { nullable: true })
  image?: string

  @Column({ type: 'numeric', default: 0, name: 'price', nullable: true })
  @Field(() => Number, { nullable: true })
  price?: number

  @Column({ length: 500, name: 'rules', nullable: true })
  @Field(() => String, { nullable: true })
  rules?: string

  @Column({ length: 500, name: 'about', nullable: true })
  @Field(() => String, { nullable: true })
  about?: string

  // Enums

  @Field(() => ChannelStatus)
  @Column({
    type: 'enum',
    enum: ChannelStatus,
    default: ChannelStatus.PUBLIC,
    name: 'channel_status'
  })
  status!: ChannelStatus

  // Relations

  @Field(() => [ChannelMember], { nullable: true })
  @OneToMany(() => ChannelMember, channelMember => channelMember.channel, {
    eager: true,
    nullable: true,
    cascade: true
  })
  members: ChannelMember[]

  @Field(() => [Post], { nullable: true })
  @OneToMany(() => Post, post => post.channel, {
    eager: true,
    nullable: true,
    cascade: true
  })
  posts: Post[]
}
