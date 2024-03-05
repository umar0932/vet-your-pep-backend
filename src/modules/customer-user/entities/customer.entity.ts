import { ObjectType, Field, ID, Int } from '@nestjs/graphql'

import { Column, Entity, Index, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Transform } from 'class-transformer'

import { Channel, ChannelMember } from '@app/channel/entities'
import { Comments } from '@app/comments/entities'
import { CustomBaseEntity } from '@app/common/entities/base.entity'
import { CalenderEvents } from '@app/events/entities'
import { Likes } from '@app/like/entities'
import { Post } from '@app/post/entities'
import { SocialProvider } from '@app/common/entities'

import { CustomerFollower } from './customer-follower.entity'

@Entity({ name: 'customer_user' })
@Index(['email'])
@ObjectType()
export class Customer extends CustomBaseEntity {
  // Primary key
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  // Complusory Variables

  @Column({ length: 50, unique: true })
  @Field(() => String)
  email!: string

  @Column({ length: 50, name: 'first_name' })
  @Field(() => String)
  firstName!: string

  @Column({ length: 50, name: 'last_name' })
  @Field(() => String)
  lastName!: string

  @Column({ name: 'password' })
  @Field(() => String)
  password!: string

  @Column({ nullable: true, default: false, name: 'is_active' })
  @Field(() => Boolean, { nullable: true })
  isActive!: boolean

  // Non Complusory Variables

  @Column({ length: 20, name: 'cell_phone', nullable: true })
  @Field(() => String, { nullable: true })
  @Transform(value => value.toString())
  cellPhone?: string

  @Column({ length: 250, name: 'profile_image', nullable: true })
  @Field(() => String, { nullable: true })
  profileImage?: string

  @Column({ length: 200, nullable: true, name: 'stripe_customer_id', unique: true })
  @Field(() => String, { nullable: true })
  stripeCustomerId?: string

  @Column({ type: 'numeric', name: 'following_count', default: 0 })
  @Field(() => Int, { nullable: true })
  totalFollowings?: number

  @Column({ type: 'numeric', name: 'followers_count', default: 0 })
  @Field(() => Int, { nullable: true })
  totalFollowers?: number

  // Enums

  // Relations

  @Field(() => [Channel], { nullable: true })
  @OneToMany(() => Channel, channel => channel.moderator, {
    nullable: true
  })
  channels?: Channel[]

  @Field(() => [Channel], { nullable: true })
  @OneToMany(() => ChannelMember, channelMember => channelMember.customer, {
    nullable: true
  })
  channelMembers?: ChannelMember[]

  @Field(() => [Comments], { nullable: true })
  @OneToMany(() => Comments, comments => comments.user, {
    nullable: true
  })
  comments?: Comments[]

  @Field(() => [CalenderEvents], { nullable: true })
  @OneToMany(() => CalenderEvents, eventCalender => eventCalender.event, {
    eager: true,
    nullable: true
  })
  calenderEvents?: CalenderEvents[]

  @Field(() => [CustomerFollower], { nullable: true })
  @OneToMany(() => CustomerFollower, (uf: CustomerFollower) => uf.followers, {
    eager: true,
    nullable: true
  })
  followers?: CustomerFollower[]

  @Field(() => [CustomerFollower], { nullable: true })
  @OneToMany(() => CustomerFollower, (uf: CustomerFollower) => uf.following, {
    eager: true,
    nullable: true
  })
  following?: CustomerFollower[]

  @Field(() => [Likes], { nullable: true })
  @OneToMany(() => Likes, like => like.user, {
    nullable: true
  })
  likes?: Likes[]

  @Field(() => [Post], { nullable: true })
  @OneToMany(() => Post, (post: Post) => post.customer, {
    nullable: true
  })
  posts?: Post[]

  @Field(() => SocialProvider, { nullable: true })
  @OneToOne(() => SocialProvider, socialProvider => socialProvider.customer, {
    nullable: true
  })
  socialProvider?: SocialProvider
}
