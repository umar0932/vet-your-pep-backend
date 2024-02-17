import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateCascadeOptions1708168310608 implements MigrationInterface {
  name = 'UpdateCascadeOptions1708168310608'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer_followers" DROP CONSTRAINT "FK_e27a557a6ba1ded60addb576924"`
    )
    await queryRunner.query(
      `ALTER TABLE "customer_followers" DROP CONSTRAINT "FK_e0acf1bc947d192fcd7c5fba789"`
    )
    await queryRunner.query(
      `ALTER TABLE "channels" DROP CONSTRAINT "FK_02d1504c4ddc63f3ec89ee565c5"`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" DROP CONSTRAINT "FK_71a10831469775a1effdd85f240"`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" DROP CONSTRAINT "FK_fa10cc851659e021426c433caa2"`
    )
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_ac94c0a677f27ef8e2c0343f2e1"`)
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_6f87d7084c41431f991b697138b"`)
    await queryRunner.query(
      `ALTER TABLE "customer_followers" ADD CONSTRAINT "FK_e27a557a6ba1ded60addb576924" FOREIGN KEY ("follower_id") REFERENCES "customer_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "customer_followers" ADD CONSTRAINT "FK_e0acf1bc947d192fcd7c5fba789" FOREIGN KEY ("following_id") REFERENCES "customer_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "channels" ADD CONSTRAINT "FK_02d1504c4ddc63f3ec89ee565c5" FOREIGN KEY ("moderator_id") REFERENCES "customer_user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD CONSTRAINT "FK_71a10831469775a1effdd85f240" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD CONSTRAINT "FK_fa10cc851659e021426c433caa2" FOREIGN KEY ("customer_id") REFERENCES "customer_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_ac94c0a677f27ef8e2c0343f2e1" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_6f87d7084c41431f991b697138b" FOREIGN KEY ("customer_id") REFERENCES "customer_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_6f87d7084c41431f991b697138b"`)
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_ac94c0a677f27ef8e2c0343f2e1"`)
    await queryRunner.query(
      `ALTER TABLE "channel_members" DROP CONSTRAINT "FK_fa10cc851659e021426c433caa2"`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" DROP CONSTRAINT "FK_71a10831469775a1effdd85f240"`
    )
    await queryRunner.query(
      `ALTER TABLE "channels" DROP CONSTRAINT "FK_02d1504c4ddc63f3ec89ee565c5"`
    )
    await queryRunner.query(
      `ALTER TABLE "customer_followers" DROP CONSTRAINT "FK_e0acf1bc947d192fcd7c5fba789"`
    )
    await queryRunner.query(
      `ALTER TABLE "customer_followers" DROP CONSTRAINT "FK_e27a557a6ba1ded60addb576924"`
    )
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_6f87d7084c41431f991b697138b" FOREIGN KEY ("customer_id") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_ac94c0a677f27ef8e2c0343f2e1" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD CONSTRAINT "FK_fa10cc851659e021426c433caa2" FOREIGN KEY ("customer_id") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "channel_members" ADD CONSTRAINT "FK_71a10831469775a1effdd85f240" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "channels" ADD CONSTRAINT "FK_02d1504c4ddc63f3ec89ee565c5" FOREIGN KEY ("moderator_id") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "customer_followers" ADD CONSTRAINT "FK_e0acf1bc947d192fcd7c5fba789" FOREIGN KEY ("following_id") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "customer_followers" ADD CONSTRAINT "FK_e27a557a6ba1ded60addb576924" FOREIGN KEY ("follower_id") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}
