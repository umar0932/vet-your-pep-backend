import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateChannelColumns1706712817339 implements MigrationInterface {
  name = 'UpdateChannelColumns1706712817339'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "channel_members" DROP CONSTRAINT "FK_71a10831469775a1effdd85f240"`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."channel_channel_status_enum" AS ENUM('PUBLIC', 'PRIVATE')`
    )
    await queryRunner.query(`DROP TABLE "channels"`)
    await queryRunner.query(
      `CREATE TABLE "channel" (
        "idChannel" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "channel_title" character varying(50) NOT NULL,
        "channel_is_paid" boolean NOT NULL DEFAULT false,
        "ref_id_moderator" uuid NOT NULL,
        "channel_background_image" character varying(250),
        "channel_image" character varying(250), 
        "channel_price" numeric DEFAULT '0',
        "channel_rules" character varying(500),
        "channels_about" character varying(500),
        "channel_status" "public"."channel_channel_status_enum" NOT NULL DEFAULT 'PUBLIC',
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_a51757d73e7e75fa77856c9bef0" UNIQUE ("channel_title"),
        CONSTRAINT "PK_a0ab344e8791673065bb2ad5a95" PRIMARY KEY ("idChannel"))`
    )
    await queryRunner.query(`ALTER TABLE "channel_members" DROP COLUMN "roleChannel"`)
    await queryRunner.query(`DROP TYPE "public"."channel_members_rolechannel_enum"`)
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD "paid_status" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."channel_members_channel_role_enum" AS ENUM('MEMBER', 'MODERATOR', 'ADMIN')`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD "channel_role" "public"."channel_members_channel_role_enum" NOT NULL DEFAULT 'MEMBER'`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD CONSTRAINT "FK_71a10831469775a1effdd85f240" FOREIGN KEY ("channel_id") REFERENCES "channel"("idChannel") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "channel_members" DROP CONSTRAINT "FK_71a10831469775a1effdd85f240"`
    )
    await queryRunner.query(`ALTER TABLE "channel_members" DROP COLUMN "channel_role"`)
    await queryRunner.query(`DROP TYPE "public"."channel_members_channel_role_enum"`)
    await queryRunner.query(`ALTER TABLE "channel_members" DROP COLUMN "paid_status"`)
    await queryRunner.query(
      `CREATE TYPE "public"."channel_members_rolechannel_enum" AS ENUM('MEMBER', 'MODERATOR', 'ADMIN')`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD "roleChannel" "public"."channel_members_rolechannel_enum" NOT NULL DEFAULT 'MEMBER'`
    )
    await queryRunner.query(`DROP TABLE "channel"`)
    await queryRunner.query(`DROP TYPE "public"."channel_channel_status_enum"`)
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD CONSTRAINT "FK_71a10831469775a1effdd85f240" FOREIGN KEY ("channel_id") REFERENCES "channels"("idChannel") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}
