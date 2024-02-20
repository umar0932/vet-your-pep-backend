import { ObjectType, Field, ID } from '@nestjs/graphql'

import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Admin } from '@app/admin/entities'
import { CustomBaseEntity } from '@app/common/entities/base.entity'

@Entity({ name: 'platform_rules' })
@ObjectType()
export class PlatFormRules extends CustomBaseEntity {
  // Primary key
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string

  // Complusory Variables

  @Column({ length: 50, unique: true })
  @Field(() => String)
  title!: string

  @Column({ length: 1000, name: 'rules' })
  @Field(() => String)
  rules!: string

  // Non Complusory Variables

  // Relations

  @Field(() => Admin)
  @ManyToOne(() => Admin, admin => admin.platFormRules, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin
}
