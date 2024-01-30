import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateChannelMembers1706619591463 implements MigrationInterface {
  name = 'CreateChannelMembers1706619591463'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."channel_members_rolechannel_enum" AS ENUM('MEMBER', 'MODERATOR', 'ADMIN')`
    )
    await queryRunner.query(
      `CREATE TABLE "channel_members" (
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "idChannelMember" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "roleChannel" "public"."channel_members_rolechannel_enum" NOT NULL DEFAULT 'MEMBER',
        "channel_id" uuid, 
        "customer_id" uuid, 
        CONSTRAINT "PK_d7b751ff402ee78df7285ac7539" PRIMARY KEY ("idChannelMember"))`
    )
    await queryRunner.query(`ALTER TABLE "channels" ALTER COLUMN "channel_price" SET DEFAULT '0'`)
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD CONSTRAINT "FK_71a10831469775a1effdd85f240" FOREIGN KEY ("channel_id") REFERENCES "channels"("idChannel") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD CONSTRAINT "FK_fa10cc851659e021426c433caa2" FOREIGN KEY ("customer_id") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "channel_members" DROP CONSTRAINT "FK_fa10cc851659e021426c433caa2"`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" DROP CONSTRAINT "FK_71a10831469775a1effdd85f240"`
    )
    await queryRunner.query(`ALTER TABLE "channels" ALTER COLUMN "channel_price" DROP DEFAULT`)
    await queryRunner.query(`DROP TABLE "channel_members"`)
    await queryRunner.query(`DROP TYPE "public"."channel_members_rolechannel_enum"`)
  }
}
