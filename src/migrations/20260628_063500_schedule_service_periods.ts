/**
 * Migration : horaires midi/soir par jour, périodes click & collect dédiées.
 */
import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

const PERIODS = ['lunch', 'evening'] as const

function periodPrefix(day: string, period: string): string {
  return `schedule_weekly_hours_${day}_${period}`
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const day of WEEKDAYS) {
    for (const period of PERIODS) {
      const prefix = periodPrefix(day, period)
      await db.execute(sql.raw(`
        ALTER TABLE "sites"
          ADD COLUMN IF NOT EXISTS "${prefix}_closed" boolean DEFAULT true,
          ADD COLUMN IF NOT EXISTS "${prefix}_restaurant_open" varchar,
          ADD COLUMN IF NOT EXISTS "${prefix}_first_pickup_slot" varchar,
          ADD COLUMN IF NOT EXISTS "${prefix}_restaurant_close" varchar,
          ADD COLUMN IF NOT EXISTS "${prefix}_last_pickup_slot" varchar;
      `))
    }

    await db.execute(sql.raw(`
      WITH ordered_slots AS (
        SELECT
          slots."_parent_id" AS site_id,
          slots."open",
          slots."close",
          slots."_order",
          ROW_NUMBER() OVER (PARTITION BY slots."_parent_id" ORDER BY slots."_order" ASC) AS slot_index
        FROM "sites_schedule_weekly_hours_${day}_slots" slots
      ),
      day_state AS (
        SELECT
          s."id" AS site_id,
          COALESCE(s."schedule_weekly_hours_${day}_closed", true) AS day_closed
        FROM "sites" s
      )
      UPDATE "sites" AS site
      SET
        "${periodPrefix(day, 'lunch')}_closed" = CASE
          WHEN day_state.day_closed THEN true
          WHEN lunch."open" IS NULL THEN true
          ELSE false
        END,
        "${periodPrefix(day, 'lunch')}_restaurant_open" = lunch."open",
        "${periodPrefix(day, 'lunch')}_first_pickup_slot" = lunch."open",
        "${periodPrefix(day, 'lunch')}_restaurant_close" = lunch."close",
        "${periodPrefix(day, 'lunch')}_last_pickup_slot" = lunch."close",
        "${periodPrefix(day, 'evening')}_closed" = CASE
          WHEN day_state.day_closed THEN true
          WHEN evening."open" IS NULL THEN true
          ELSE false
        END,
        "${periodPrefix(day, 'evening')}_restaurant_open" = evening."open",
        "${periodPrefix(day, 'evening')}_first_pickup_slot" = evening."open",
        "${periodPrefix(day, 'evening')}_restaurant_close" = evening."close",
        "${periodPrefix(day, 'evening')}_last_pickup_slot" = evening."close"
      FROM day_state
      LEFT JOIN ordered_slots lunch
        ON lunch.site_id = day_state.site_id AND lunch.slot_index = 1
      LEFT JOIN ordered_slots evening
        ON evening.site_id = day_state.site_id AND evening.slot_index = 2
      WHERE site."id" = day_state.site_id;
    `))

    await db.execute(sql.raw(`DROP TABLE IF EXISTS "sites_schedule_weekly_hours_${day}_slots" CASCADE;`))
    await db.execute(sql.raw(`ALTER TABLE "sites" DROP COLUMN IF EXISTS "schedule_weekly_hours_${day}_closed";`))
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "sites_schedule_exceptions_periods" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "closed" boolean DEFAULT false,
      "restaurant_open" varchar,
      "first_pickup_slot" varchar,
      "restaurant_close" varchar,
      "last_pickup_slot" varchar
    );
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "sites_schedule_exceptions_periods"
        ADD CONSTRAINT "sites_schedule_exceptions_periods_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."sites_schedule_exceptions"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "sites_schedule_exceptions_periods_order_idx"
      ON "sites_schedule_exceptions_periods" USING btree ("_order");
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "sites_schedule_exceptions_periods_parent_id_idx"
      ON "sites_schedule_exceptions_periods" USING btree ("_parent_id");
  `)

  await db.execute(sql`
    INSERT INTO "sites_schedule_exceptions_periods"
      ("_order", "_parent_id", "id", "closed", "restaurant_open", "first_pickup_slot", "restaurant_close", "last_pickup_slot")
    SELECT
      ch."_order",
      ch."_parent_id",
      ch."id",
      false,
      ch."open",
      ch."open",
      ch."close",
      ch."close"
    FROM "sites_schedule_exceptions_custom_hours" ch
    ON CONFLICT ("id") DO NOTHING;
  `)

  await db.execute(sql`DROP TABLE IF EXISTS "sites_schedule_exceptions_custom_hours" CASCADE;`)

  await db.execute(sql`
    ALTER TABLE "sites"
      DROP COLUMN IF EXISTS "click_and_collect_enabled_by_schedule",
      DROP COLUMN IF EXISTS "click_and_collect_min_lead_time_minutes",
      DROP COLUMN IF EXISTS "click_and_collect_last_pickup_slot_time",
      DROP COLUMN IF EXISTS "click_and_collect_same_day_only";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sites"
      ADD COLUMN IF NOT EXISTS "click_and_collect_enabled_by_schedule" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "click_and_collect_min_lead_time_minutes" numeric DEFAULT 30,
      ADD COLUMN IF NOT EXISTS "click_and_collect_last_pickup_slot_time" varchar,
      ADD COLUMN IF NOT EXISTS "click_and_collect_same_day_only" boolean DEFAULT true;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "sites_schedule_exceptions_custom_hours" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "open" varchar,
      "close" varchar
    );
  `)

  await db.execute(sql`DROP TABLE IF EXISTS "sites_schedule_exceptions_periods" CASCADE;`)

  for (const day of WEEKDAYS) {
    await db.execute(sql.raw(`ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "schedule_weekly_hours_${day}_closed" boolean DEFAULT false;`))
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS "sites_schedule_weekly_hours_${day}_slots" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "open" varchar,
        "close" varchar
      );
    `))

    for (const period of PERIODS) {
      const prefix = periodPrefix(day, period)
      await db.execute(sql.raw(`
        ALTER TABLE "sites"
          DROP COLUMN IF EXISTS "${prefix}_closed",
          DROP COLUMN IF EXISTS "${prefix}_restaurant_open",
          DROP COLUMN IF EXISTS "${prefix}_first_pickup_slot",
          DROP COLUMN IF EXISTS "${prefix}_restaurant_close",
          DROP COLUMN IF EXISTS "${prefix}_last_pickup_slot";
      `))
    }
  }
}
