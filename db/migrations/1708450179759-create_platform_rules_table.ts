import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreatePlatformRulesTable1708450179759 implements MigrationInterface {
  name = 'CreatePlatformRulesTable1708450179759'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "platform_rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(50) NOT NULL,
        "rules" character varying(1000) NOT NULL,
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "admin_id" uuid, CONSTRAINT "UQ_7f185709aa3ae067cd9041eded7" UNIQUE ("title"),
        CONSTRAINT "PK_e1b97afb0c26fec2a815039aa7b" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb"`
    )
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "id"`)
    await queryRunner.query(
      `ALTER TABLE "comments" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`
    )
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id")`
    )
    await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "PK_a9323de3f8bced7539a794b4a37"`)
    await queryRunner.query(`ALTER TABLE "likes" DROP COLUMN "id"`)
    await queryRunner.query(`ALTER TABLE "likes" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`)
    await queryRunner.query(
      `ALTER TABLE "likes" ADD CONSTRAINT "PK_a9323de3f8bced7539a794b4a37" PRIMARY KEY ("id")`
    )
    await queryRunner.query(
      `ALTER TABLE "customer_followers" DROP CONSTRAINT "PK_8e55b9b60290a4d6226a9385f0b"`
    )
    await queryRunner.query(`ALTER TABLE "customer_followers" DROP COLUMN "id"`)
    await queryRunner.query(
      `ALTER TABLE "customer_followers" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`
    )
    await queryRunner.query(
      `ALTER TABLE "customer_followers" ADD CONSTRAINT "PK_8e55b9b60290a4d6226a9385f0b" PRIMARY KEY ("id")`
    )
    await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "PK_40731c7151fe4be3116e45ddf73"`)
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "id"`)
    await queryRunner.query(
      `ALTER TABLE "events" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`
    )
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id")`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" DROP CONSTRAINT "PK_95976b619edca48aed364c70c36"`
    )
    await queryRunner.query(`ALTER TABLE "channel_members" DROP COLUMN "id"`)
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD CONSTRAINT "PK_95976b619edca48aed364c70c36" PRIMARY KEY ("id")`
    )
    await queryRunner.query(
      `ALTER TABLE "platform_rules" ADD CONSTRAINT "FK_a5cd854bdfe86a6535b3884cb91" FOREIGN KEY ("admin_id") REFERENCES "admin_user"("id") ON DELETE SET NULL ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "platform_rules" DROP CONSTRAINT "FK_a5cd854bdfe86a6535b3884cb91"`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" DROP CONSTRAINT "PK_95976b619edca48aed364c70c36"`
    )
    await queryRunner.query(`ALTER TABLE "channel_members" DROP COLUMN "id"`)
    await queryRunner.query(`ALTER TABLE "channel_members" ADD "id" SERIAL NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD CONSTRAINT "PK_95976b619edca48aed364c70c36" PRIMARY KEY ("id")`
    )
    await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "PK_40731c7151fe4be3116e45ddf73"`)
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "id"`)
    await queryRunner.query(`ALTER TABLE "events" ADD "id" SERIAL NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id")`
    )
    await queryRunner.query(
      `ALTER TABLE "customer_followers" DROP CONSTRAINT "PK_8e55b9b60290a4d6226a9385f0b"`
    )
    await queryRunner.query(`ALTER TABLE "customer_followers" DROP COLUMN "id"`)
    await queryRunner.query(`ALTER TABLE "customer_followers" ADD "id" SERIAL NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "customer_followers" ADD CONSTRAINT "PK_8e55b9b60290a4d6226a9385f0b" PRIMARY KEY ("id")`
    )
    await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "PK_a9323de3f8bced7539a794b4a37"`)
    await queryRunner.query(`ALTER TABLE "likes" DROP COLUMN "id"`)
    await queryRunner.query(`ALTER TABLE "likes" ADD "id" SERIAL NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "likes" ADD CONSTRAINT "PK_a9323de3f8bced7539a794b4a37" PRIMARY KEY ("id")`
    )
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb"`
    )
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "id"`)
    await queryRunner.query(`ALTER TABLE "comments" ADD "id" SERIAL NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id")`
    )
    await queryRunner.query(`DROP TABLE "platform_rules"`)
  }
}
