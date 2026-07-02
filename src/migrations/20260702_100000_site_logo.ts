/**
 * Migration : logo du site (relation media).
 */
import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sites"
      ADD COLUMN IF NOT EXISTS "logo_id" integer;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "sites"
        ADD CONSTRAINT "sites_logo_id_media_id_fk"
        FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "sites_logo_idx" ON "sites" USING btree ("logo_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sites" DROP CONSTRAINT IF EXISTS "sites_logo_id_media_id_fk";
  `)
  await db.execute(sql`
    DROP INDEX IF EXISTS "sites_logo_idx";
  `)
  await db.execute(sql`
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "logo_id";
  `)
}
