import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_sites_schedule_weekly_hours_day" AS ENUM(
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
      );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_sites_schedule_exceptions_type" AS ENUM('closed', 'custom_hours');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_sites_click_and_collect_manual_status" AS ENUM('auto', 'open', 'closed');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_sites_click_and_collect_slot_duration_minutes" AS ENUM('15', '30', '45', '60');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "contact_email" varchar;
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "contact_phone" varchar;
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "contact_address" varchar;
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "click_and_collect_enabled_by_schedule" boolean DEFAULT true;
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "click_and_collect_manual_status" "enum_sites_click_and_collect_manual_status" DEFAULT 'auto';
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "click_and_collect_min_lead_time_minutes" numeric DEFAULT 30;
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "click_and_collect_slot_duration_minutes" "enum_sites_click_and_collect_slot_duration_minutes" DEFAULT '30';
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "click_and_collect_max_orders_per_slot" numeric;
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "click_and_collect_tracking_show_pickup_slot" boolean DEFAULT true;
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "click_and_collect_tracking_show_countdown" boolean DEFAULT true;

    CREATE TABLE IF NOT EXISTS "sites_schedule_weekly_hours" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "day" "enum_sites_schedule_weekly_hours_day" NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "sites_schedule_weekly_hours_slots" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "open" varchar NOT NULL,
      "close" varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "sites_schedule_exceptions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "start_date" timestamp(3) with time zone NOT NULL,
      "end_date" timestamp(3) with time zone,
      "type" "enum_sites_schedule_exceptions_type" DEFAULT 'closed' NOT NULL,
      "label" varchar,
      "note" varchar
    );

    CREATE TABLE IF NOT EXISTS "sites_schedule_exceptions_custom_hours" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "open" varchar,
      "close" varchar
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

    DO $$ BEGIN
      ALTER TABLE "sites_schedule_weekly_hours_slots"
        ADD CONSTRAINT "sites_schedule_weekly_hours_slots_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."sites_schedule_weekly_hours"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "sites_schedule_exceptions"
        ADD CONSTRAINT "sites_schedule_exceptions_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "sites_schedule_exceptions_custom_hours"
        ADD CONSTRAINT "sites_schedule_exceptions_custom_hours_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."sites_schedule_exceptions"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "sites_schedule_weekly_hours_order_idx" ON "sites_schedule_weekly_hours" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "sites_schedule_weekly_hours_parent_id_idx" ON "sites_schedule_weekly_hours" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "sites_schedule_weekly_hours_slots_order_idx" ON "sites_schedule_weekly_hours_slots" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "sites_schedule_weekly_hours_slots_parent_id_idx" ON "sites_schedule_weekly_hours_slots" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "sites_schedule_exceptions_order_idx" ON "sites_schedule_exceptions" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "sites_schedule_exceptions_parent_id_idx" ON "sites_schedule_exceptions" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "sites_schedule_exceptions_custom_hours_order_idx" ON "sites_schedule_exceptions_custom_hours" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "sites_schedule_exceptions_custom_hours_parent_id_idx" ON "sites_schedule_exceptions_custom_hours" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "sites_schedule_weekly_hours_slots" CASCADE;
    DROP TABLE IF EXISTS "sites_schedule_weekly_hours" CASCADE;
    DROP TABLE IF EXISTS "sites_schedule_exceptions_custom_hours" CASCADE;
    DROP TABLE IF EXISTS "sites_schedule_exceptions" CASCADE;

    ALTER TABLE "sites" DROP COLUMN IF EXISTS "contact_email";
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "contact_phone";
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "contact_address";
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "click_and_collect_enabled_by_schedule";
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "click_and_collect_manual_status";
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "click_and_collect_min_lead_time_minutes";
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "click_and_collect_slot_duration_minutes";
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "click_and_collect_max_orders_per_slot";
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "click_and_collect_tracking_show_pickup_slot";
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "click_and_collect_tracking_show_countdown";

    DROP TYPE IF EXISTS "public"."enum_sites_schedule_weekly_hours_day";
    DROP TYPE IF EXISTS "public"."enum_sites_schedule_exceptions_type";
    DROP TYPE IF EXISTS "public"."enum_sites_click_and_collect_manual_status";
    DROP TYPE IF EXISTS "public"."enum_sites_click_and_collect_slot_duration_minutes";
  `)
}
