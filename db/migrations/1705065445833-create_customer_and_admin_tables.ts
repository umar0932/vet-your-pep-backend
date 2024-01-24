import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCustomerAndAdminTables1705065445833 implements MigrationInterface {
  name = 'CreateCustomerAndAdminTables1705065445833'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."social_provider_social_provider_enum" AS ENUM('google', 'facebook')`
    )
    await queryRunner.query(
      `CREATE TABLE "social_provider" (
        "id" SERIAL NOT NULL, 
        "social_provider" "public"."social_provider_social_provider_enum" NOT NULL, 
        "socialId" character varying NOT NULL, 
        "ref_id_customer" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        CONSTRAINT "UQ_11c163e15c0f61964953efc47eb" UNIQUE ("socialId"), 
        CONSTRAINT "REL_9fc14f13d814ab10af08bb44e8" UNIQUE ("ref_id_customer"), 
        CONSTRAINT "PK_27f0b9006e0c7a2779e77a68298" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "customer_user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(50) NOT NULL,
        "first_name" character varying(50) NOT NULL,
        "last_name" character varying(50) NOT NULL,
        "password" character varying NOT NULL,
        "mediaUrl" character varying(250),
        "cell_phone" character varying(20),
        "stripe_customer_id" character varying(200),
        "is_active" boolean DEFAULT true,
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
      `CREATE TABLE "admin_user" (
        "idAdminUser" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "email" character varying(50) NOT NULL, 
        "first_name" character varying(50) NOT NULL, 
        "last_name" character varying(50) NOT NULL, 
        "password" character varying NOT NULL, "mediaUrl" character varying(250), 
        "is_active" boolean DEFAULT true,
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_840ac5cd67be99efa5cd989bf9f" UNIQUE ("email"), 
        CONSTRAINT "PK_8ff51739a822a76e6b3e78c02da" PRIMARY KEY ("idAdminUser"))`
    )
    await queryRunner.query(
      `ALTER TABLE "social_provider" ADD CONSTRAINT "FK_9fc14f13d814ab10af08bb44e8c" FOREIGN KEY ("ref_id_customer") REFERENCES "customer_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "social_provider" DROP CONSTRAINT "FK_9fc14f13d814ab10af08bb44e8c"`
    )
    await queryRunner.query(`DROP TABLE "admin_user"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_e9d0d27c3aa5ac4bebc070c595"`)
    await queryRunner.query(`DROP TABLE "customer_user"`)
    await queryRunner.query(`DROP TABLE "social_provider"`)
    await queryRunner.query(`DROP TYPE "public"."social_provider_social_provider_enum"`)
  }
}
