/**
 * Migration : tables orders, order_sequences et relations (commandes click & collect).
 */
import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_orders_status" AS ENUM('in_progress', 'completed', 'cancelled');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "order_sequences" (
      "id" serial PRIMARY KEY NOT NULL,
      "site_id" integer NOT NULL,
      "next_number" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "orders" (
      "id" serial PRIMARY KEY NOT NULL,
      "site_id" integer NOT NULL,
      "order_number" numeric NOT NULL,
      "status" "enum_orders_status" DEFAULT 'in_progress' NOT NULL,
      "payment_status" "enum_orders_payment_status" DEFAULT 'pending' NOT NULL,
      "customer_name" varchar NOT NULL,
      "customer_email" varchar NOT NULL,
      "customer_phone" varchar NOT NULL,
      "pickup_slot_value" varchar NOT NULL,
      "pickup_slot_date" timestamp(3) with time zone NOT NULL,
      "pickup_slot_time" varchar NOT NULL,
      "total" numeric NOT NULL,
      "tracking_token" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "orders_lines" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "product_id" integer,
      "name" varchar NOT NULL,
      "price" numeric NOT NULL,
      "quantity" numeric NOT NULL
    );
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "order_sequences"
        ADD CONSTRAINT "order_sequences_site_id_fk"
        FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "orders"
        ADD CONSTRAINT "orders_site_id_fk"
        FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "orders_lines"
        ADD CONSTRAINT "orders_lines_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "orders_lines"
        ADD CONSTRAINT "orders_lines_product_id_fk"
        FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "order_sequences_site_id_idx" ON "order_sequences" USING btree ("site_id");
  `)

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "orders_tracking_token_idx" ON "orders" USING btree ("tracking_token");
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "orders_site_id_idx" ON "orders" USING btree ("site_id");
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "orders_lines_order_idx" ON "orders_lines" USING btree ("_order");
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "orders_lines_parent_id_idx" ON "orders_lines" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "orders_lines" CASCADE;`)
  await db.execute(sql`DROP TABLE IF EXISTS "orders" CASCADE;`)
  await db.execute(sql`DROP TABLE IF EXISTS "order_sequences" CASCADE;`)
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_orders_status";`)
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_orders_payment_status";`)
}
