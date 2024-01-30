import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql'

import { Column, Entity, Index, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Transform } from 'class-transformer'

import { CustomBaseEntity } from '@app/common/entities/base.entity'
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
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 50, unique: true })
  @Field()
  email!: string

  @Column({ length: 50, name: 'first_name' })
  @Field()
  firstName!: string

  @Column({ length: 50, name: 'last_name' })
  @Field()
  lastName!: string

  @Column({ name: 'password' })
  @Field()
  password!: string

  @Column({ length: 250, nullable: true })
  @Field(() => String, { nullable: true })
  mediaUrl?: string

  @Column({ length: 20, name: 'cell_phone', nullable: true })
  @Field({ nullable: true })
  @Transform(value => value.toString())
  cellPhone?: string

  @Column({ length: 200, nullable: true, name: 'stripe_customer_id', unique: true })
  @Field(() => String, { nullable: true })
  stripeCustomerId?: string

  @Field(() => SocialProvider, { nullable: true })
  @OneToOne(() => SocialProvider, socialProvider => socialProvider.customer, {
    eager: true,
    nullable: true
  })
  socialProvider?: SocialProvider

  @Field(() => UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    name: 'user_role'
  })
  role!: UserRole

  // @ManyToMany(() => Channels, channels => channels.members)
  // @JoinTable()
  // channels: Channels[]

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

  @Column({ type: 'numeric', name: 'following_count', default: 0 })
  @Field(() => Int, { nullable: true })
  totalFollowings: number

  @Column({ type: 'numeric', name: 'follower_count', default: 0 })
  @Field(() => Int, { nullable: true })
  totalFollowers: number

  @Column({ nullable: true, default: true, name: 'is_active' })
  @Field({ nullable: true })
  isActive?: boolean
}
