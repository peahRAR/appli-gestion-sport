import { MigrationInterface, QueryRunner } from "typeorm";

export class PushNotifications1784553000000 implements MigrationInterface {
  name = 'PushNotifications1784553000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" ADD "push_notifications_enabled" boolean NOT NULL DEFAULT true
    `);

    await queryRunner.query(`
      CREATE TABLE "push_subscription" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "endpoint" text NOT NULL,
        "p256dh" character varying NOT NULL,
        "auth" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_push_subscription_endpoint" UNIQUE ("endpoint"),
        CONSTRAINT "PK_push_subscription_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_push_subscription_userId" ON "push_subscription" ("userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "push_subscription"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "push_notifications_enabled"`);
  }
}
