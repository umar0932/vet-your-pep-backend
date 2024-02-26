import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreatePostsTable1708685389219 implements MigrationInterface {
  name = 'CreatePostsTable1708685389219'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "posts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "channel_id" uuid,
        "customer_id" uuid,
        "body" text NOT NULL DEFAULT '',
        "images" text,
        "like_count" bigint NOT NULL DEFAULT '0',
        "created_by" character varying(50) NOT NULL DEFAULT 'system',
        "updated_by" character varying(50) DEFAULT 'system',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),   
        CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_ac94c0a677f27ef8e2c0343f2e1" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_6f87d7084c41431f991b697138b" FOREIGN KEY ("customer_id") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_6f87d7084c41431f991b697138b"`)
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_ac94c0a677f27ef8e2c0343f2e1"`)
    await queryRunner.query(`DROP TABLE "posts"`)
  }
}
