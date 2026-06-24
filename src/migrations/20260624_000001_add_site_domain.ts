import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "domain" varchar;
    CREATE UNIQUE INDEX IF NOT EXISTS "sites_slug_idx" ON "sites" USING btree ("slug");
    CREATE UNIQUE INDEX IF NOT EXISTS "sites_domain_idx" ON "sites" USING btree ("domain");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "sites_domain_idx";
    DROP INDEX IF EXISTS "sites_slug_idx";
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "domain";
  `)
}
