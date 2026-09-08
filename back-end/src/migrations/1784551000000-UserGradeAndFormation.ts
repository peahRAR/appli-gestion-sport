import { MigrationInterface, QueryRunner } from "typeorm";

export class UserGradeAndFormation1784551000000 implements MigrationInterface {
  name = 'UserGradeAndFormation1784551000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // DEFAULT backfills existing rows automatically; grade/formation only
    // matter for FMMAF-affiliated members but every user gets a value so the
    // columns stay NOT NULL (simpler queries, no null-checks downstream).
    await queryRunner.query(`
      ALTER TABLE "user" ADD "grade" character varying(10) NOT NULL DEFAULT 'blanc'
    `);
    await queryRunner.query(`
      ALTER TABLE "user" ADD "formation" character varying(20) NOT NULL DEFAULT 'aucune'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "formation"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "grade"`);
  }
}
