import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddChannelsStatus1706106644941 implements MigrationInterface {
  name = 'AddChannelsStatus1706106644941'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "channels" ADD "channel_price" numeric`)
    await queryRunner.query(
      `CREATE TYPE "public"."channels_channel_status_enum" AS ENUM('PUBLIC', 'PRIVATE')`
    )
    await queryRunner.query(
      `ALTER TABLE "channels" ADD "channel_status" "public"."channels_channel_status_enum" NOT NULL DEFAULT 'PUBLIC'`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."channels_paid_status_enum" AS ENUM('PAID', 'FREE')`
    )
    await queryRunner.query(
      `ALTER TABLE "channels" ADD "paid_status" "public"."channels_paid_status_enum" NOT NULL DEFAULT 'FREE'`
    )
    await queryRunner.query(
      `ALTER TYPE "public"."social_provider_social_provider_enum" RENAME TO "social_provider_social_provider_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."social_provider_social_provider_enum" AS ENUM('google')`
    )
    await queryRunner.query(
      `ALTER TABLE "social_provider" ALTER COLUMN "social_provider" TYPE "public"."social_provider_social_provider_enum" USING "social_provider"::"text"::"public"."social_provider_social_provider_enum"`
    )
    await queryRunner.query(`DROP TYPE "public"."social_provider_social_provider_enum_old"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."social_provider_social_provider_enum_old" AS ENUM('google', 'facebook')`
    )
    await queryRunner.query(
      `ALTER TABLE "social_provider" ALTER COLUMN "social_provider" TYPE "public"."social_provider_social_provider_enum_old" USING "social_provider"::"text"::"public"."social_provider_social_provider_enum_old"`
    )
    await queryRunner.query(`DROP TYPE "public"."social_provider_social_provider_enum"`)
    await queryRunner.query(
      `ALTER TYPE "public"."social_provider_social_provider_enum_old" RENAME TO "social_provider_social_provider_enum"`
    )
    await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "paid_status"`)
    await queryRunner.query(`DROP TYPE "public"."channels_paid_status_enum"`)
    await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "channel_status"`)
    await queryRunner.query(`DROP TYPE "public"."channels_channel_status_enum"`)
    await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "channel_price"`)
  }
}
