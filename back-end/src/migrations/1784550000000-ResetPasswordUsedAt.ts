import { MigrationInterface, QueryRunner } from "typeorm";

export class ResetPasswordUsedAt1784550000000 implements MigrationInterface {
  name = 'ResetPasswordUsedAt1784550000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kept instead of deleting the row on use, so a second attempt with the
    // same token can be distinguished from "expired"/"never existed".
    await queryRunner.query(`
      ALTER TABLE "reset_password" ADD "usedAt" TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reset_password" DROP COLUMN "usedAt"
    `);
  }
}
