import { ObjectType, Field, ID } from '@nestjs/graphql'

import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Channel } from '@app/channel/entities'
import { CustomBaseEntity } from '@app/common/entities/base.entity'

@Entity({ name: 'events' })
@ObjectType()
export class Events extends CustomBaseEntity {
  // Primary key
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number

  // Complusory Variables

  @Column({ type: 'text', default: '' })
  @Field(() => String)
  text!: string

  @Column({ length: 50, unique: true })
  @Field(() => String)
  title!: string

  // Non Complusory Variables

  @Column({ type: 'simple-array', nullable: true })
  @Field(() => [String], { nullable: true })
  images?: string[]

  // Relations

  @Field(() => Channel, { nullable: true })
  @ManyToOne(() => Channel, channel => channel.posts, { nullable: true })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel
}
