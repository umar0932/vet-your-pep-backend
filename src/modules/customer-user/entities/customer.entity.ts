import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql'

import { Column, Entity, Index, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Transform } from 'class-transformer'

import { Channel, ChannelMember } from '@app/channel/entities'
import { Comments } from '@app/comments/entities'
import { CustomBaseEntity } from '@app/common/entities/base.entity'
import { Likes } from '@app/like/entities'
import { Post } from '@app/post/entities'
import { SocialProvider } from '@app/common/entities'

import { UserRole } from '../customer-user.constants'
import { CustomerFollower } from './customer-follower.entity'

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'The role of Users'
})

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

  @Field(() => UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    name: 'user_role'
  })
  role!: UserRole

  // Relations

  @Field(() => [Channel], { nullable: true })
  @OneToMany(() => Channel, channel => channel.moderator, {
    nullable: true,
    cascade: true
  })
  channels: Channel[]

  @OneToMany(() => ChannelMember, channelMember => channelMember.customer, {
    eager: true,
    nullable: true,
    cascade: true
  })
  channelMembers: ChannelMember[]

  @Field(() => [Comments], { nullable: true })
  @OneToMany(() => Comments, comments => comments.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  comments: Comments[]

  @Field(() => [CustomerFollower], { nullable: true })
  @OneToMany(() => CustomerFollower, (uf: CustomerFollower) => uf.followers, {
    eager: true,
    nullable: true,
    cascade: true
  })
  followers: CustomerFollower[]

  @Field(() => [CustomerFollower], { nullable: true })
  @OneToMany(() => CustomerFollower, (uf: CustomerFollower) => uf.following, {
    eager: true,
    nullable: true,
    cascade: true
  })
  following: CustomerFollower[]

  @Field(() => [Likes], { nullable: true })
  @OneToMany(() => Likes, like => like.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  likes: Likes[]

  @Field(() => [Post], { nullable: true })
  @OneToMany(() => Post, (post: Post) => post.customer, {
    eager: true,
    nullable: true,
    cascade: true
  })
  posts: Post[]

  @Field(() => SocialProvider, { nullable: true })
  @OneToOne(() => SocialProvider, socialProvider => socialProvider.customer, {
    eager: true,
    nullable: true
  })
  socialProvider?: SocialProvider
}
