import { MigrationInterface, QueryRunner } from "typeorm";

export class AuditLogAndNullableLicenseNumber1784545348000 implements MigrationInterface {
  name = 'AuditLogAndNullableLicenseNumber1784545348000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "audit_log" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "actorUserId" uuid NOT NULL,
        "action" character varying NOT NULL,
        "affectedCount" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_log_id" PRIMARY KEY ("id")
      )
    `);

    // Allows a season purge to clear the license number while keeping the row
    // (and its federation link) intact.
    await queryRunner.query(`
      ALTER TABLE "user_license" ALTER COLUMN "number_encrypted" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_license" ALTER COLUMN "number_encrypted" SET NOT NULL
    `);
    await queryRunner.query(`DROP TABLE "audit_log"`);
  }
}
