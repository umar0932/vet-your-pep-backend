import { ObjectType, Field, ID } from '@nestjs/graphql'

import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm'

import { Customer } from '@app/customer-user/entities'
import { CustomBaseEntity } from '@app/common/entities'
import { Events } from './event.entity'

@Entity({ name: 'calender_events' })
@ObjectType()
export class CalenderEvents extends CustomBaseEntity {
  // Primary key
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string

  // Complusory Variables

  @Column({ default: false, name: 'add_to_calender' })
  @Field(() => Boolean)
  addToCalender: boolean

  // Enums

  // Relations

  @Field(() => Customer)
  @ManyToOne(() => Customer, customer => customer.calenderEvents, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer

  @Field(() => Events)
  @ManyToOne(() => Events, event => event.calenderEvents, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'event_id' })
  event!: Events
}
