/**
 * Migration : représentant légal sur sites (pages mentions légales).
 */
import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sites"
      ADD COLUMN IF NOT EXISTS "legal_legal_representative" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sites"
      DROP COLUMN IF EXISTS "legal_legal_representative";
  `)
}
