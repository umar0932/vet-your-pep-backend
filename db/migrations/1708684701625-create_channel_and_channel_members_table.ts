import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateChannelAndChannelMembersTable1708684701625 implements MigrationInterface {
  name = 'CreateChannelAndChannelMembersTable1708684701625'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."channels_channel_status_enum" AS ENUM('PUBLIC', 'PRIVATE')`
    )
    await queryRunner.query(
      `CREATE TABLE "channels" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(50) NOT NULL,
        "is_paid" boolean NOT NULL DEFAULT false,
        "moderator_id" uuid NOT NULL,
        "about" character varying(500),
        "background_image" character varying(250),
        "image" character varying(250),
        "price" numeric DEFAULT '0',
        "rules" character varying(500),
        "total_members" numeric NOT NULL DEFAULT '0',
        "channel_status" "public"."channels_channel_status_enum" NOT NULL DEFAULT 'PUBLIC',
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_9e68a1854184a9457f03759b8c8" UNIQUE ("title"),
        CONSTRAINT "PK_bc603823f3f741359c2339389f9" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."channel_members_channel_role_enum" AS ENUM('MEMBER', 'MODERATOR', 'ADMIN')`
    )
    await queryRunner.query(
      `CREATE TABLE "channel_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "channel_id" uuid,
        "customer_id" uuid,
        "paid_status" boolean NOT NULL DEFAULT false,
        "channel_role" "public"."channel_members_channel_role_enum" NOT NULL DEFAULT 'MEMBER',
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_95976b619edca48aed364c70c36" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "channels" ADD CONSTRAINT "FK_02d1504c4ddc63f3ec89ee565c5" FOREIGN KEY ("moderator_id") REFERENCES "customer_user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD CONSTRAINT "FK_71a10831469775a1effdd85f240" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD CONSTRAINT "FK_fa10cc851659e021426c433caa2" FOREIGN KEY ("customer_id") REFERENCES "customer_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "channel_members" DROP CONSTRAINT "FK_fa10cc851659e021426c433caa2"`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" DROP CONSTRAINT "FK_71a10831469775a1effdd85f240"`
    )
    await queryRunner.query(
      `ALTER TABLE "channels" DROP CONSTRAINT "FK_02d1504c4ddc63f3ec89ee565c5"`
    )
    await queryRunner.query(`DROP TABLE "channel_members"`)
    await queryRunner.query(`DROP TYPE "public"."channel_members_channel_role_enum"`)
    await queryRunner.query(`DROP TABLE "channels"`)
    await queryRunner.query(`DROP TYPE "public"."channels_channel_status_enum"`)
  }
}
