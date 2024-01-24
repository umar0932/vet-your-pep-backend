import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql'

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

import { CustomBaseEntity } from '@app/common/entities/base.entity'

import { ChannelsStatus, PaidStatusEnum } from '../channels.constants'

registerEnumType(ChannelsStatus, {
  name: 'ChannelsStatus',
  description: 'The status of channels'
})

registerEnumType(PaidStatusEnum, {
  name: 'PaidStatusEnum',
  description: 'The status of channels'
})

@Entity({ name: 'channels' })
@ObjectType()
export class Channels extends CustomBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  idChannel!: string

  @Column({ length: 50, name: 'channels_title', unique: true })
  @Field(() => String)
  channelsTitle!: string

  @Column({ type: 'uuid', name: 'ref_id_moderator' })
  @Field(() => String)
  refIdModerator!: string

  @Column({ length: 500, name: 'channels_rule', nullable: true })
  @Field(() => String, { nullable: true })
  channelsRule?: string

  @Column({ length: 500, name: 'about_channels', nullable: true })
  @Field(() => String, { nullable: true })
  channelsAbout?: string

  @Column({ length: 250, name: 'channels_image', nullable: true })
  @Field(() => String, { nullable: true })
  channelsImage?: string

  @Column({ name: 'channel_price', type: 'numeric', nullable: true })
  @Field(() => Number)
  channelPrice?: number

  @Column({ length: 250, name: 'channels_background_image', nullable: true })
  @Field(() => String, { nullable: true })
  channelsBackgroundImage?: string

  @Field(() => ChannelsStatus)
  @Column({
    type: 'enum',
    enum: ChannelsStatus,
    default: ChannelsStatus.PUBLIC,
    name: 'channel_status'
  })
  channelStatus!: ChannelsStatus

  @Field(() => PaidStatusEnum)
  @Column({
    type: 'enum',
    enum: PaidStatusEnum,
    default: PaidStatusEnum.FREE,
    name: 'paid_status'
  })
  paidStatusEnum!: PaidStatusEnum

  // @ManyToMany(() => Customer, customer => customer.channels)
  // @JoinTable()
  // members: Customer[]
}
