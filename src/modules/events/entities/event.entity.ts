import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql'

import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Channel } from '@app/channel/entities'
import { CustomBaseEntity } from '@app/common/entities/base.entity'

import { EventLocationType } from '../event.constants'

registerEnumType(EventLocationType, {
  name: 'EventLocationType',
  description: 'The status of event'
})

@Entity({ name: 'events' })
@ObjectType()
export class Events extends CustomBaseEntity {
  // Primary key
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string

  // Complusory Variables

  @Column({ type: 'text', default: '' })
  @Field(() => String)
  text!: string

  @Column({ length: 50, unique: true })
  @Field(() => String)
  title!: string

  @Column('timestamptz', { name: 'start_date' })
  @Field(() => Date)
  startDate!: Date

  @Field(() => EventLocationType)
  @Column({
    type: 'enum',
    enum: EventLocationType,
    default: EventLocationType.ONLINE,
    name: 'event_status'
  })
  eventLocationType!: EventLocationType

  // Non Complusory Variables

  @Column({ type: 'simple-array', nullable: true })
  @Field(() => [String], { nullable: true })
  images?: string[]

  // Relations

  @Field(() => Channel)
  @ManyToOne(() => Channel, channel => channel.posts, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel
}
