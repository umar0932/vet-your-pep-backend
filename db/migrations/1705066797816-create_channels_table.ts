import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateChannelsTable1705066797816 implements MigrationInterface {
  name = 'CreateChannelsTable1705066797816'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "channels" ( 
        "idChannel" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "channels_title" character varying(50) NOT NULL,
        "ref_id_moderator" uuid NOT NULL, "channels_rule" character varying(500),
        "about_channels" character varying(500), 
        "channels_image" character varying(250),
        "channels_background_image" character varying(250),
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_490e2c1f4d8d80c5c07ec202a9a" UNIQUE ("channels_title"),
        CONSTRAINT "PK_1be4bbdf811f1a7c50b9352b3b6" PRIMARY KEY ("idChannel"))`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."customer_user_user_role_enum" AS ENUM('MODERATOR', 'USER')`
    )
    await queryRunner.query(
      `ALTER TABLE "customer_user" ADD "user_role" "public"."customer_user_user_role_enum" NOT NULL DEFAULT 'USER'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customer_user" DROP COLUMN "user_role"`)
    await queryRunner.query(`DROP TYPE "public"."customer_user_user_role_enum"`)
    await queryRunner.query(`DROP TABLE "channels"`)
  }
}
