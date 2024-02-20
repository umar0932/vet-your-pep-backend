import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddEventChanelConstrain1708430019314 implements MigrationInterface {
  name = 'AddEventChanelConstrain1708430019314'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_ede43682dcaad7a5c1f97d476f7"`)
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_ede43682dcaad7a5c1f97d476f7" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_ede43682dcaad7a5c1f97d476f7"`)
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_ede43682dcaad7a5c1f97d476f7" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}
