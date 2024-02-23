import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateEventsTable1708686610607 implements MigrationInterface {
  name = 'CreateEventsTable1708686610607'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."events_event_status_enum" AS ENUM('online', 'onsite')`
    )
    await queryRunner.query(
      `CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "channel_id" uuid,
        "text" text NOT NULL DEFAULT '',
        "title" character varying(50) NOT NULL,
        "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "event_status" "public"."events_event_status_enum" NOT NULL DEFAULT 'online',
        "images" text,
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_bab6cf3a1e33e6790e9b9bd7d1d" UNIQUE ("title"),
        CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_ede43682dcaad7a5c1f97d476f7" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_ede43682dcaad7a5c1f97d476f7"`)
    await queryRunner.query(`DROP TABLE "events"`)
    await queryRunner.query(`DROP TYPE "public"."events_event_status_enum"`)
  }
}
