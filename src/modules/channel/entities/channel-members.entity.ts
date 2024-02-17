import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql'

import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm'

import { Customer } from '@app/customer-user/entities'
import { CustomBaseEntity } from '@app/common/entities'

import { Channel } from './channel.entity'
import { ChannelUserRole } from '../channel.constants'

registerEnumType(ChannelUserRole, {
  name: 'ChannelUserRole',
  description: 'The status of ChannelUserRole'
})

@Entity({ name: 'channel_members' })
@ObjectType()
export class ChannelMember extends CustomBaseEntity {
  // Primary key
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id!: number

  // Complusory Variables

  @Column({ default: false, name: 'paid_status' })
  @Field(() => Boolean)
  paidStatus: boolean

  // Enums

  @Column({
    type: 'enum',
    enum: ChannelUserRole,
    default: ChannelUserRole.MEMBER,
    name: 'channel_role'
  })
  @Field(() => ChannelUserRole)
  roleChannel: ChannelUserRole

  // Relations

  @Field(() => Channel)
  @ManyToOne(() => Channel, channel => channel.members, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel

  @Field(() => Customer)
  @ManyToOne(() => Customer, customer => customer.channelMembers, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer
}
