/**
 * Migration : dernier créneau C&C et option commandes jour même uniquement.
 */
import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sites"
      ADD COLUMN IF NOT EXISTS "click_and_collect_last_pickup_slot_time" varchar,
      ADD COLUMN IF NOT EXISTS "click_and_collect_same_day_only" boolean DEFAULT true;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sites"
      DROP COLUMN IF EXISTS "click_and_collect_last_pickup_slot_time",
      DROP COLUMN IF EXISTS "click_and_collect_same_day_only";
  `)
}
