import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToAppointments1734537600000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add unique constraint to prevent double booking at database level
    // This ensures that for any given doctor and datetime, only one CONFIRMED appointment can exist
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_unique_doctor_datetime_confirmed" 
      ON "appointments" ("strapi_doctor_id", "appointment_date") 
      WHERE status = 'CONFIRMED';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_unique_doctor_datetime_confirmed";
    `);
  }
}
