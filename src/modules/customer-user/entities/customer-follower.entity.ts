import { Field, Int, ObjectType } from '@nestjs/graphql'

import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'

import { CustomBaseEntity } from '@app/common/entities'

import { Customer } from './customer.entity'

@Entity({ name: 'customer_followers' })
@ObjectType()
export class CustomerFollower extends CustomBaseEntity {
  // Primary key
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  // Relations

  @Field(() => Customer, { nullable: true })
  @ManyToOne(() => Customer, customer => customer.followers, {
    nullable: true
  })
  @JoinColumn({ name: 'follower_id' })
  followers: Customer

  @Field(() => Customer, { nullable: true })
  @ManyToOne(() => Customer, customer => customer.following, {
    nullable: true
  })
  @JoinColumn({ name: 'following_id' })
  following: Customer
}
