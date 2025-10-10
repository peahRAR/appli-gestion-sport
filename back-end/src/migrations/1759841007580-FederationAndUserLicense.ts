import { MigrationInterface, QueryRunner } from "typeorm";

export class FederationAndUserLicense1759841007580 implements MigrationInterface {
  name = 'FederationAndUserLicense1759841007580'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // +++ utile si ton Postgres n'a pas encore l'extension (sinon ce sera ignoré)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "federation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(32) NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "PK_7164a5cf57ddfc6972b1e352126" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_8212ea7d100b5ef708aa26a1b9" ON "federation" ("code")
    `);

    // +++ SEED des fédés (idempotent)
    await queryRunner.query(`
      INSERT INTO "federation" ("code","name") VALUES
        ('FSGT','Fédération Sportive et Gymnique du Travail'),
        ('FMMAF','Fédération Française de MMA'),
        ('LEGACY','Licence importée (fédé inconnue)')
      ON CONFLICT ("code") DO NOTHING;
    `);

    await queryRunner.query(`
      CREATE TABLE "user_license" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "number_encrypted" json NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "valid_from" date, "valid_to" date, "userId" uuid, "federationId" uuid, CONSTRAINT "UQ_71c34a36d6eb0f0ffa47bdefea8" UNIQUE ("userId", "federationId"), CONSTRAINT "PK_f9fdeafeac79f9c3ef6acbca1f2" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      ALTER TABLE "user_license" ADD CONSTRAINT "FK_1f236ee512d052a2d30b16ca88c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "user_license" ADD CONSTRAINT "FK_30d1a691924712c3337e80270f0" FOREIGN KEY ("federationId") REFERENCES "federation"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_license" DROP CONSTRAINT "FK_30d1a691924712c3337e80270f0"`);
    await queryRunner.query(`ALTER TABLE "user_license" DROP CONSTRAINT "FK_1f236ee512d052a2d30b16ca88c"`);
    await queryRunner.query(`DROP TABLE "user_license"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8212ea7d100b5ef708aa26a1b9"`);
    await queryRunner.query(`DROP TABLE "federation"`);
  }
}
