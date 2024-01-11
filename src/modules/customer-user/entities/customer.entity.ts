import { ObjectType, Field, ID } from '@nestjs/graphql'

import { Column, Entity, Index, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Transform } from 'class-transformer'

import { CustomBaseEntity } from '@app/common/entities/base.entity'
import { SocialProvider } from '@app/common/entities'

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

  @Column({ nullable: true, default: true, name: 'is_active' })
  @Field({ nullable: true })
  isActive?: boolean
}
