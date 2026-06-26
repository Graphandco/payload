import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "contact_street" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "contact_postal_code" varchar;
  `)
  await db.execute(sql`
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "contact_city" varchar;
  `)

  await db.execute(sql`
    UPDATE "sites"
    SET "contact_street" = "contact_address"
    WHERE "contact_address" IS NOT NULL
      AND btrim("contact_address") <> ''
      AND ("contact_street" IS NULL OR btrim("contact_street") = '');
  `)

  await db.execute(sql`
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "contact_address";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "contact_address" varchar;
  `)

  await db.execute(sql`
    UPDATE "sites"
    SET "contact_address" = NULLIF(
      btrim(
        concat_ws(
          E'\n',
          NULLIF(btrim("contact_street"), ''),
          NULLIF(btrim(concat_ws(' ', "contact_postal_code", "contact_city")), '')
        )
      ),
      ''
    )
    WHERE "contact_street" IS NOT NULL
       OR "contact_postal_code" IS NOT NULL
       OR "contact_city" IS NOT NULL;
  `)

  await db.execute(sql`ALTER TABLE "sites" DROP COLUMN IF EXISTS "contact_street";`)
  await db.execute(sql`ALTER TABLE "sites" DROP COLUMN IF EXISTS "contact_postal_code";`)
  await db.execute(sql`ALTER TABLE "sites" DROP COLUMN IF EXISTS "contact_city";`)
}
