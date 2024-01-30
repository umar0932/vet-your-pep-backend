import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql'

import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm'

import { Customer } from '@app/customer-user/entities'
import { CustomBaseEntity } from '@app/common/entities'

import { Channels } from './channels.entity'
import { ChannelUserRole } from '../channels.constants'

registerEnumType(ChannelUserRole, {
  name: 'ChannelUserRole',
  description: 'The status of ChannelUserRole'
})

@Entity({ name: 'channel_members' })
@ObjectType()
export class ChannelMember extends CustomBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  idChannelMember: string

  @Field(() => Channels)
  @ManyToOne(() => Channels, channel => channel.members)
  @JoinColumn({ name: 'channel_id' })
  channel: Channels

  @Field(() => Customer)
  @ManyToOne(() => Customer, customer => customer.channelMembers)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer

  @Column({ type: 'enum', enum: ChannelUserRole, default: ChannelUserRole.MEMBER })
  @Field(() => ChannelUserRole)
  roleChannel: ChannelUserRole
}
