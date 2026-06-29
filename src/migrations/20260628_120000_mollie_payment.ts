/**
 * Migration : clé API Mollie par site et ID paiement sur les commandes.
 */
import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sites"
      ADD COLUMN IF NOT EXISTS "click_and_collect_mollie_api_key" varchar;
  `)

  await db.execute(sql`
    ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "mollie_payment_id" varchar;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "orders_mollie_payment_id_idx" ON "orders" ("mollie_payment_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "orders_mollie_payment_id_idx";
  `)

  await db.execute(sql`
    ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "mollie_payment_id";
  `)

  await db.execute(sql`
    ALTER TABLE "sites"
      DROP COLUMN IF EXISTS "click_and_collect_mollie_api_key";
  `)
}
