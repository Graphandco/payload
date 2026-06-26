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

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const day of WEEKDAYS) {
    await db.execute(
      sql.raw(`
      ALTER TABLE "sites"
        ADD COLUMN IF NOT EXISTS "schedule_weekly_hours_${day}_closed" boolean DEFAULT false;
    `),
    )

    await db.execute(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS "sites_schedule_weekly_hours_${day}_slots" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "open" varchar,
        "close" varchar
      );
    `),
    )

    await db.execute(
      sql.raw(`
      DO $$ BEGIN
        ALTER TABLE "sites_schedule_weekly_hours_${day}_slots"
          ADD CONSTRAINT "sites_schedule_weekly_hours_${day}_slots_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `),
    )

    await db.execute(
      sql.raw(`
      CREATE INDEX IF NOT EXISTS "sites_schedule_weekly_hours_${day}_slots_order_idx"
        ON "sites_schedule_weekly_hours_${day}_slots" USING btree ("_order");
    `),
    )

    await db.execute(
      sql.raw(`
      CREATE INDEX IF NOT EXISTS "sites_schedule_weekly_hours_${day}_slots_parent_id_idx"
        ON "sites_schedule_weekly_hours_${day}_slots" USING btree ("_parent_id");
    `),
    )
  }

  await db.execute(sql`
    UPDATE "sites" SET
      schedule_weekly_hours_monday_closed = true,
      schedule_weekly_hours_tuesday_closed = true,
      schedule_weekly_hours_wednesday_closed = true,
      schedule_weekly_hours_thursday_closed = true,
      schedule_weekly_hours_friday_closed = true,
      schedule_weekly_hours_saturday_closed = true,
      schedule_weekly_hours_sunday_closed = true;
  `)

  for (const day of WEEKDAYS) {
    await db.execute(
      sql.raw(`
      WITH day_rows AS (
        SELECT wh."_parent_id" AS site_id, wh."id" AS weekly_id
        FROM "sites_schedule_weekly_hours" wh
        WHERE wh."day" = '${day}'::"enum_sites_schedule_weekly_hours_day"
      ),
      slot_counts AS (
        SELECT dr.site_id, dr.weekly_id, COUNT(s."id") AS slot_count
        FROM day_rows dr
        LEFT JOIN "sites_schedule_weekly_hours_slots" s ON s."_parent_id" = dr.weekly_id
        GROUP BY dr.site_id, dr.weekly_id
      )
      UPDATE "sites" site
      SET "schedule_weekly_hours_${day}_closed" = (sc.slot_count = 0)
      FROM slot_counts sc
      WHERE site."id" = sc.site_id;
    `),
    )

    await db.execute(
      sql.raw(`
      INSERT INTO "sites_schedule_weekly_hours_${day}_slots"
        ("_order", "_parent_id", "id", "open", "close")
      SELECT
        s."_order",
        wh."_parent_id",
        s."id",
        s."open",
        s."close"
      FROM "sites_schedule_weekly_hours" wh
      INNER JOIN "sites_schedule_weekly_hours_slots" s ON s."_parent_id" = wh."id"
      WHERE wh."day" = '${day}'::"enum_sites_schedule_weekly_hours_day"
      ON CONFLICT ("id") DO NOTHING;
    `),
    )
  }

  await db.execute(sql`DROP TABLE IF EXISTS "sites_schedule_weekly_hours_slots" CASCADE;`)
  await db.execute(sql`DROP TABLE IF EXISTS "sites_schedule_weekly_hours" CASCADE;`)
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_sites_schedule_weekly_hours_day";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_sites_schedule_weekly_hours_day" AS ENUM(
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
      );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "sites_schedule_weekly_hours" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "day" "enum_sites_schedule_weekly_hours_day" NOT NULL
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "sites_schedule_weekly_hours_slots" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "open" varchar NOT NULL,
      "close" varchar NOT NULL
    );
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "sites_schedule_weekly_hours"
        ADD CONSTRAINT "sites_schedule_weekly_hours_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "sites_schedule_weekly_hours_slots"
        ADD CONSTRAINT "sites_schedule_weekly_hours_slots_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."sites_schedule_weekly_hours"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  let order = 0
  for (const day of WEEKDAYS) {
    order += 1
    await db.execute(
      sql.raw(`
      INSERT INTO "sites_schedule_weekly_hours" ("_order", "_parent_id", "id", "day")
      SELECT
        ${order},
        site."id",
        md5(site."id"::text || '${day}')::varchar,
        '${day}'::"enum_sites_schedule_weekly_hours_day"
      FROM "sites" site
      WHERE site."schedule_weekly_hours_${day}_closed" IS NOT TRUE
        AND EXISTS (
          SELECT 1
          FROM "sites_schedule_weekly_hours_${day}_slots" slots
          WHERE slots."_parent_id" = site."id"
        );
    `),
    )

    await db.execute(
      sql.raw(`
      INSERT INTO "sites_schedule_weekly_hours_slots" ("_order", "_parent_id", "id", "open", "close")
      SELECT
        slots."_order",
        md5(site."id"::text || '${day}')::varchar,
        slots."id",
        slots."open",
        slots."close"
      FROM "sites" site
      INNER JOIN "sites_schedule_weekly_hours_${day}_slots" slots ON slots."_parent_id" = site."id"
      WHERE site."schedule_weekly_hours_${day}_closed" IS NOT TRUE;
    `),
    )
  }

  for (const day of WEEKDAYS) {
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "sites_schedule_weekly_hours_${day}_slots" CASCADE;`))
    await db.execute(
      sql.raw(`ALTER TABLE "sites" DROP COLUMN IF EXISTS "schedule_weekly_hours_${day}_closed";`),
    )
  }
}
