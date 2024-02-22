import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddColumnsInEvent1708610962585 implements MigrationInterface {
  name = 'AddColumnsInEvent1708610962585'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_6f87d7084c41431f991b697138b"`)
    await queryRunner.query(
      `ALTER TABLE "events" ADD "start_date" TIMESTAMP WITH TIME ZONE NOT NULL`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."events_event_status_enum" AS ENUM('online', 'onsite')`
    )
    await queryRunner.query(
      `ALTER TABLE "events" ADD "event_status" "public"."events_event_status_enum" NOT NULL DEFAULT 'online'`
    )
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_6f87d7084c41431f991b697138b" FOREIGN KEY ("customer_id") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_6f87d7084c41431f991b697138b"`)
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "event_status"`)
    await queryRunner.query(`DROP TYPE "public"."events_event_status_enum"`)
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "start_date"`)
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_6f87d7084c41431f991b697138b" FOREIGN KEY ("customer_id") REFERENCES "customer_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  }
}
