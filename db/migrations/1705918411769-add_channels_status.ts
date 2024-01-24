import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddChannelsStatus1705918411769 implements MigrationInterface {
  name = 'AddChannelsStatus1705918411769'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "channels" ADD "channel_price" numeric`)
    await queryRunner.query(
      `ALTER TABLE "channels" ADD "channel_status" "public"."channels_channel_status_enum" NOT NULL DEFAULT 'PUBLIC'`
    )
    await queryRunner.query(
      `ALTER TABLE "channels" ADD "paid_status" "public"."channels_paid_status_enum" NOT NULL DEFAULT 'FREE'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "paid_status"`)
    await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "channel_status"`)
    await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "channel_price"`)
  }
}
