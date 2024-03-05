import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCalenderEventsTable1709625956215 implements MigrationInterface {
  name = 'CreateCalenderEventsTable1709625956215'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "calender_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customer_id" uuid,
        "event_id" uuid,
        "add_to_calender" boolean NOT NULL DEFAULT false,
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_1f6cd347cfa262cd2593bf004a1" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "calender_events" ADD CONSTRAINT "FK_3673274ecd7e64d18d53dd1db81" FOREIGN KEY ("customer_id") REFERENCES "customer_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "calender_events" ADD CONSTRAINT "FK_2b209c85765320833b4dbbbf241" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calender_events" DROP CONSTRAINT "FK_2b209c85765320833b4dbbbf241"`
    )
    await queryRunner.query(
      `ALTER TABLE "calender_events" DROP CONSTRAINT "FK_3673274ecd7e64d18d53dd1db81"`
    )
    await queryRunner.query(`DROP TABLE "calender_events"`)
  }
}
