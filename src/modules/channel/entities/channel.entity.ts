import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql'

import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { Customer } from '@app/customer-user/entities'
import { CustomBaseEntity } from '@app/common/entities/base.entity'
import { Events } from '@app/events/entities'
import { Post } from '@app/post/entities'

import { ChannelStatus } from '../channel.constants'
import { ChannelMember } from './channel-members.entity'

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

  // Non Complusory Variables

  @Column({ length: 500, name: 'about', nullable: true })
  @Field(() => String, { nullable: true })
  about?: string

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

  @Column({ type: 'numeric', name: 'total_members', default: 0 })
  @Field(() => Int, { nullable: true })
  totalMembers?: number

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
    nullable: true
  })
  members: ChannelMember[]

  @Field(() => [Post], { nullable: true })
  @OneToMany(() => Post, post => post.channel, {
    eager: true,
    nullable: true
  })
  posts: Post[]

  @Field(() => [Events], { nullable: true })
  @OneToMany(() => Events, events => events.channel, {
    eager: true,
    nullable: true
  })
  events: Events[]

  @Field(() => Customer)
  @ManyToOne(() => Customer, {
    eager: true,
    onDelete: 'SET NULL'
  })
  @JoinColumn({ name: 'moderator_id', referencedColumnName: 'id' })
  moderator!: Customer
}
