import { MigrationInterface, QueryRunner } from "typeorm";

export class UserActivityTracking1784552000000 implements MigrationInterface {
  name = 'UserActivityTracking1784552000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" ADD "last_login_at" TIMESTAMP
    `);
    await queryRunner.query(`
      ALTER TABLE "user" ADD "last_course_registration_at" TIMESTAMP
    `);
    await queryRunner.query(`
      ALTER TABLE "user" ADD "status" character varying(30) NOT NULL DEFAULT 'active'
    `);
    await queryRunner.query(`
      ALTER TABLE "user" ADD "deactivated_at" TIMESTAMP
    `);
    await queryRunner.query(`
      ALTER TABLE "user" ADD "deactivation_reason" character varying(50)
    `);

    // Backfill deliberate: every existing user gets last_login_at = NOW() so
    // nobody is retroactively treated as "inactive for 3 months" the moment
    // this deploys (there's no prior login-tracking data to backfill from).
    await queryRunner.query(`UPDATE "user" SET "last_login_at" = now()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deactivation_reason"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deactivated_at"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_course_registration_at"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_login_at"`);
  }
}
