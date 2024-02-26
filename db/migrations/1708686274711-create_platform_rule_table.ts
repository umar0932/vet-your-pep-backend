import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreatePlatformRuleTable1708686274711 implements MigrationInterface {
  name = 'CreatePlatformRuleTable1708686274711'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "platform_rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "admin_id" uuid,
        "title" character varying(50) NOT NULL,
        "rules" character varying(1000) NOT NULL,
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_7f185709aa3ae067cd9041eded7" UNIQUE ("title"),
        CONSTRAINT "PK_e1b97afb0c26fec2a815039aa7b" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "platform_rules" ADD CONSTRAINT "FK_a5cd854bdfe86a6535b3884cb91" FOREIGN KEY ("admin_id") REFERENCES "admin_user"("id") ON DELETE SET NULL ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "platform_rules" DROP CONSTRAINT "FK_a5cd854bdfe86a6535b3884cb91"`
    )
    await queryRunner.query(`DROP TABLE "platform_rules"`)
  }
}
