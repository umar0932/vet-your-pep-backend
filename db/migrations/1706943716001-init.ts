import { MigrationInterface, QueryRunner } from 'typeorm'

export class Init1706943716001 implements MigrationInterface {
  name = 'Init1706943716001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."social_provider_social_provider_enum" AS ENUM('google')`
    )
    await queryRunner.query(
      `CREATE TABLE "social_provider" ("id" SERIAL NOT NULL, "social_provider" "public"."social_provider_social_provider_enum" NOT NULL, "socialId" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ref_id_customer" uuid, CONSTRAINT "UQ_11c163e15c0f61964953efc47eb" UNIQUE ("socialId"), CONSTRAINT "REL_9fc14f13d814ab10af08bb44e8" UNIQUE ("ref_id_customer"), CONSTRAINT "PK_27f0b9006e0c7a2779e77a68298" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "likes" (
        "id" SERIAL NOT NULL, "user_id" uuid, "post_id" integer,
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_a9323de3f8bced7539a794b4a37" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."channels_channel_status_enum" AS ENUM('PUBLIC', 'PRIVATE')`
    )
    await queryRunner.query(
      `CREATE TABLE "channels" (
        "title" character varying(50) NOT NULL,
        "is_paid" boolean NOT NULL DEFAULT false,
        "moderator_id" uuid NOT NULL,
        "background_image" character varying(250),
        "image" character varying(250),
        "price" numeric DEFAULT '0',
        "rules" character varying(500),
        "about" character varying(500),
        "channel_status" "public"."channels_channel_status_enum" NOT NULL DEFAULT 'PUBLIC',
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        CONSTRAINT "UQ_9e68a1854184a9457f03759b8c8" UNIQUE ("title"),
        CONSTRAINT "PK_bc603823f3f741359c2339389f9" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."channel_members_channel_role_enum" AS ENUM('MEMBER', 'MODERATOR', 'ADMIN')`
    )
    await queryRunner.query(
      `CREATE TABLE "channel_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "paid_status" boolean NOT NULL DEFAULT false, 
        "channel_role" "public"."channel_members_channel_role_enum" NOT NULL DEFAULT 'MEMBER',
        "channel_id" uuid,
        "customer_id" uuid,
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        CONSTRAINT "PK_d7b751ff402ee78df7285ac7539" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."customer_user_user_role_enum" AS ENUM('MODERATOR', 'USER')`
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
        "following_count" numeric NOT NULL DEFAULT '0',
        "followers_count" numeric NOT NULL DEFAULT '0',
        "user_role" "public"."customer_user_user_role_enum" NOT NULL DEFAULT 'USER',
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
      `CREATE TABLE "customer_followers" (
        "id" SERIAL NOT NULL, "follower_id" uuid, "following_id" uuid,
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_8e55b9b60290a4d6226a9385f0b" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "posts" (
        "id" SERIAL NOT NULL, "body" text NOT NULL DEFAULT '',
        "images" text, "like_count" bigint NOT NULL DEFAULT '0',
        "channel_id" uuid, 
        "customer_id" uuid,
        "created_by" character varying(50) NOT NULL DEFAULT 'system', 
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`
    )
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
        CONSTRAINT "PK_8ff51739a822a76e6b3e78c02da" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "social_provider" ADD CONSTRAINT "FK_9fc14f13d814ab10af08bb44e8c" FOREIGN KEY ("ref_id_customer") REFERENCES "customer_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "likes" ADD CONSTRAINT "FK_3f519ed95f775c781a254089171" FOREIGN KEY ("user_id") REFERENCES "customer_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "likes" ADD CONSTRAINT "FK_741df9b9b72f328a6d6f63e79ff" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD CONSTRAINT "FK_71a10831469775a1effdd85f240" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD CONSTRAINT "FK_fa10cc851659e021426c433caa2" FOREIGN KEY ("customer_id") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "customer_followers" ADD CONSTRAINT "FK_e27a557a6ba1ded60addb576924" FOREIGN KEY ("follower_id") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "customer_followers" ADD CONSTRAINT "FK_e0acf1bc947d192fcd7c5fba789" FOREIGN KEY ("following_id") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_ac94c0a677f27ef8e2c0343f2e1" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_6f87d7084c41431f991b697138b" FOREIGN KEY ("customer_id") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_6f87d7084c41431f991b697138b"`)
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_ac94c0a677f27ef8e2c0343f2e1"`)
    await queryRunner.query(
      `ALTER TABLE "customer_followers" DROP CONSTRAINT "FK_e0acf1bc947d192fcd7c5fba789"`
    )
    await queryRunner.query(
      `ALTER TABLE "customer_followers" DROP CONSTRAINT "FK_e27a557a6ba1ded60addb576924"`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" DROP CONSTRAINT "FK_fa10cc851659e021426c433caa2"`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" DROP CONSTRAINT "FK_71a10831469775a1effdd85f240"`
    )
    await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "FK_741df9b9b72f328a6d6f63e79ff"`)
    await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "FK_3f519ed95f775c781a254089171"`)
    await queryRunner.query(
      `ALTER TABLE "social_provider" DROP CONSTRAINT "FK_9fc14f13d814ab10af08bb44e8c"`
    )
    await queryRunner.query(`DROP TABLE "admin_user"`)
    await queryRunner.query(`DROP TABLE "posts"`)
    await queryRunner.query(`DROP TABLE "customer_followers"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_e9d0d27c3aa5ac4bebc070c595"`)
    await queryRunner.query(`DROP TABLE "customer_user"`)
    await queryRunner.query(`DROP TYPE "public"."customer_user_user_role_enum"`)
    await queryRunner.query(`DROP TABLE "channel_members"`)
    await queryRunner.query(`DROP TYPE "public"."channel_members_channel_role_enum"`)
    await queryRunner.query(`DROP TABLE "channels"`)
    await queryRunner.query(`DROP TYPE "public"."channels_channel_status_enum"`)
    await queryRunner.query(`DROP TABLE "likes"`)
    await queryRunner.query(`DROP TABLE "social_provider"`)
    await queryRunner.query(`DROP TYPE "public"."social_provider_social_provider_enum"`)
  }
}
