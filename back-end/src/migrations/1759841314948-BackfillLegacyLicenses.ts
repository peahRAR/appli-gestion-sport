import { MigrationInterface, QueryRunner } from "typeorm";

export class BackfillLegacyLicenses1759841314948 implements MigrationInterface {
  name = 'BackfillLegacyLicenses1759841314948'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Créer/mettre à jour FSGT et récupérer son id (UPSERT + RETURNING)
    const inserted: any[] = await queryRunner.query(`
      INSERT INTO "federation" ("code","name")
      VALUES ($1, $2)
      ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name"
      RETURNING id
    `, ['FSGT', 'Fédération Sportive et Gymnique du Travail']);

    let fsgtId: string | undefined = inserted?.[0]?.id;

    if (!fsgtId) {
      const rows: any[] = await queryRunner.query(
        `SELECT id FROM "federation" WHERE code = $1 LIMIT 1`,
        ['FSGT']
      );
      fsgtId = rows?.[0]?.id;
    }
    if (!fsgtId) {
      throw new Error('FSGT federation still missing after insert/select');
    }

    // 2) Copier les anciennes licences (user.license) vers user_license (FSGT), sans doublon
    await queryRunner.query(
      `
      INSERT INTO "user_license" ("id","userId","federationId","number_encrypted","createdAt")
      SELECT uuid_generate_v4(), u.id, $1::uuid, u.license::json, now()
      FROM "user" u
      WHERE u.license IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "user_license" ul
          WHERE ul."userId" = u.id AND ul."federationId" = $1::uuid
        )
      `,
      [fsgtId]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprime uniquement les lignes de backfill FSGT issues d'utilisateurs qui avaient user.license
    await queryRunner.query(`
      DELETE FROM "user_license" ul
      USING "federation" f, "user" u
      WHERE ul."federationId" = f.id
        AND f.code = 'FSGT'
        AND u.id = ul."userId"
        AND u.license IS NOT NULL;
    `);
  }
}
