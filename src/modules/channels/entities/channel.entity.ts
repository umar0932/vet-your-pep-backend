import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql'

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { CustomBaseEntity } from '@app/common/entities/base.entity'

import { ChannelStatus } from '../channel.constants'
import { ChannelMember } from './channel-member.entity'

registerEnumType(ChannelStatus, {
  name: 'ChannelStatus',
  description: 'The status of channels'
})

@Entity({ name: 'channel' })
@ObjectType()
export class Channel extends CustomBaseEntity {
  // Primary keys

  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  idChannel!: string

  // Complusory Variables

  @Column({ length: 50, name: 'channel_title', unique: true })
  @Field(() => String)
  channelTitle!: string

  @Column({ default: false, name: 'channel_is_paid' })
  @Field(() => Boolean)
  isChannelPaid!: boolean

  @Column({ type: 'uuid', name: 'ref_id_moderator' })
  @Field(() => String)
  refIdModerator!: string

  // Non Complusory Variables

  @Column({ length: 250, name: 'channel_background_image', nullable: true })
  @Field(() => String, { nullable: true })
  channelBackgroundImage?: string

  @Column({ length: 250, name: 'channel_image', nullable: true })
  @Field(() => String, { nullable: true })
  channelImage?: string

  @Column({ type: 'numeric', default: 0, name: 'channel_price', nullable: true })
  @Field(() => Number, { nullable: true })
  channelPrice?: number

  @Column({ length: 500, name: 'channel_rules', nullable: true })
  @Field(() => String, { nullable: true })
  channelRules?: string

  @Column({ length: 500, name: 'channels_about', nullable: true })
  @Field(() => String, { nullable: true })
  channelsAbout?: string

  // Enums

  @Field(() => ChannelStatus)
  @Column({
    type: 'enum',
    enum: ChannelStatus,
    default: ChannelStatus.PUBLIC,
    name: 'channel_status'
  })
  channelStatus!: ChannelStatus

  // Relations

  @OneToMany(() => ChannelMember, channelMember => channelMember.channel, {
    eager: true,
    nullable: true,
    cascade: true
  })
  members: ChannelMember[]
}
