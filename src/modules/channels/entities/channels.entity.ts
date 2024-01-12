import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql'

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

import { CustomBaseEntity } from '@app/common/entities/base.entity'

import { ChannelsStatus } from '../channels.constants'

registerEnumType(ChannelsStatus, {
  name: 'ChannelsStatus',
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

  @Column({ length: 250, name: 'channels_background_image', nullable: true })
  @Field(() => String, { nullable: true })
  channelsbackgroundImage?: string

  // @ManyToMany(() => Customer, customer => customer.channels)
  // @JoinTable()
  // members: Customer[]
}
