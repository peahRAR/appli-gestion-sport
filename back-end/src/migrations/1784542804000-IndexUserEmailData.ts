import { MigrationInterface, QueryRunner } from "typeorm";

// UsersService.findByEmail() (used on every login attempt and on account
// creation's duplicate-email check) filters on `email->>'data'` — without an
// index that's a full table scan on every login. This is a functional index
// on the JSON payload's ciphertext, not on any plaintext value.
export class IndexUserEmailData1784542804000 implements MigrationInterface {
  name = 'IndexUserEmailData1784542804000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "IDX_user_email_data" ON "user" (("email" ->> 'data'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_user_email_data"`);
  }
}
