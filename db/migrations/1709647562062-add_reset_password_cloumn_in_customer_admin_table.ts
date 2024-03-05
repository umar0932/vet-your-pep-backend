import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddResetPasswordCloumnInCustomerAdminTable1709647562062 implements MigrationInterface {
  name = 'AddResetPasswordCloumnInCustomerAdminTable1709647562062'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer_user" ADD "reset_password_otp" character varying(150)`
    )
    await queryRunner.query(
      `ALTER TABLE "admin_user" ADD "reset_password_otp" character varying(150)`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "admin_user" DROP COLUMN "reset_password_otp"`)
    await queryRunner.query(`ALTER TABLE "customer_user" DROP COLUMN "reset_password_otp"`)
  }
}
