import { MigrationInterface, QueryRunner } from "typeorm";

export class CourseWaitlist1791158400000 implements MigrationInterface {
  name = 'CourseWaitlist1791158400000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "course_waitlist" (
        "id" SERIAL NOT NULL,
        "eventId" integer NOT NULL,
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_course_waitlist_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_course_waitlist_event" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_course_waitlist_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_course_waitlist_event_user" ON "course_waitlist" ("eventId", "userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_course_waitlist_event_user"`);
    await queryRunner.query(`DROP TABLE "course_waitlist"`);
  }
}
