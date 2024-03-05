import { ObjectType, Field, ID } from '@nestjs/graphql'

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { CustomBaseEntity } from '@app/common/entities/base.entity'
import { PlatFormRules } from '@app/platform-rules/entities'

@Entity({ name: 'admin_user' })
@ObjectType()
export class Admin extends CustomBaseEntity {
  // Primary key
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string

  // Complusory Variables

  @Column({ length: 50, unique: true })
  @Field(() => String)
  email!: string

  @Column({ length: 50, name: 'first_name' })
  @Field(() => String)
  firstName!: string

  @Column({ length: 50, name: 'last_name' })
  @Field(() => String)
  lastName!: string

  @Column({ name: 'password' })
  @Field(() => String)
  password!: string

  @Column({ nullable: true, default: false, name: 'is_active' })
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean

  // Non Complusory Variables

  @Field(() => String, { nullable: true })
  @Column({ length: 250, nullable: true })
  profileImage?: string

  @Column({ length: 150, name: 'reset_password_otp', nullable: true })
  @Field(() => String, { nullable: true })
  resetPaswordOTP?: string

  // Relations

  @Field(() => [PlatFormRules], { nullable: true })
  @OneToMany(() => PlatFormRules, platFormRules => platFormRules.admin, {
    eager: true,
    nullable: true
  })
  platFormRules: PlatFormRules[]
}
