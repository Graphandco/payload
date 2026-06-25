import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_weights_fk";

    ALTER TABLE "products" DROP COLUMN IF EXISTS "quantity";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "is_to_buy";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "is_in_cart";
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price" numeric;

    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "weights_id";

    DROP TABLE IF EXISTS "weights" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "weights" (
      "id" serial PRIMARY KEY NOT NULL,
      "site_id" integer,
      "date" timestamp(3) with time zone,
      "poids" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "products" DROP COLUMN IF EXISTS "price";
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "quantity" numeric DEFAULT 1 NOT NULL;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_to_buy" boolean DEFAULT false;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_in_cart" boolean DEFAULT false;
  `)
}
