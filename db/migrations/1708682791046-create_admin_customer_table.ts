import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateAdminCustomerTable1708682791046 implements MigrationInterface {
  name = 'CreateAdminCustomerTable1708682791046'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "admin_user" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "email" character varying(50) NOT NULL,
          "first_name" character varying(50) NOT NULL,
          "last_name" character varying(50) NOT NULL,
          "password" character varying NOT NULL,
          "is_active" boolean DEFAULT false,
          "profileImage" character varying(250),
          "created_by" character varying(50) NOT NULL DEFAULT 'system',
          "updated_by" character varying(50) DEFAULT 'system',
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_840ac5cd67be99efa5cd989bf9f" UNIQUE ("email"),
          CONSTRAINT "PK_a28028ba709cd7e5053a86857b4" PRIMARY KEY ("id"))`
    )

    await queryRunner.query(
      `CREATE TABLE "customer_user" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "email" character varying(50) NOT NULL,
          "first_name" character varying(50) NOT NULL,
          "last_name" character varying(50) NOT NULL,
          "password" character varying NOT NULL,
          "is_active" boolean DEFAULT false,
          "cell_phone" character varying(20),
          "profile_image" character varying(250),
          "stripe_customer_id" character varying(200),
          "created_by" character varying(50) NOT NULL DEFAULT 'system',
          "updated_by" character varying(50) DEFAULT 'system',
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_e9d0d27c3aa5ac4bebc070c595b" UNIQUE ("email"),
          CONSTRAINT "UQ_decc660ee519e75b5fa705fe177" UNIQUE ("stripe_customer_id"),
          CONSTRAINT "PK_5d1f609371a285123294fddcf3a" PRIMARY KEY ("id"))`
    )

    await queryRunner.query(
      `CREATE INDEX "IDX_e9d0d27c3aa5ac4bebc070c595" ON "customer_user" ("email") `
    )

    await queryRunner.query(
      `CREATE TYPE "public"."social_provider_social_provider_enum" AS ENUM('google')`
    )

    await queryRunner.query(
      `CREATE TABLE "social_provider" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "social_id" character varying NOT NULL,
      "customer_id" uuid,
      "social_provider" "public"."social_provider_social_provider_enum" NOT NULL,
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_9ce71b95d110cea015f9702adda" UNIQUE ("social_id"),
      CONSTRAINT "REL_4fdc01924ac0a57444eb4ea4de" UNIQUE ("customer_id"),
      CONSTRAINT "PK_27f0b9006e0c7a2779e77a68298" PRIMARY KEY ("id"))`
    )

    await queryRunner.query(
      `ALTER TABLE "social_provider" ADD CONSTRAINT "FK_4fdc01924ac0a57444eb4ea4de0" FOREIGN KEY ("customer_id") REFERENCES "customer_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "social_provider" DROP CONSTRAINT "FK_4fdc01924ac0a57444eb4ea4de0"`
    )
    await queryRunner.query(`DROP TABLE "admin_user"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_e9d0d27c3aa5ac4bebc070c595"`)
    await queryRunner.query(`DROP TABLE "customer_user"`)
    await queryRunner.query(`DROP TABLE "social_provider"`)
    await queryRunner.query(`DROP TYPE "public"."social_provider_social_provider_enum"`)
  }
}
