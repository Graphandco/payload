/**
 * Migration : mentions légales sites, numéro facture commandes, séquences factures.
 */
import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sites"
      ADD COLUMN IF NOT EXISTS "legal_company_name" varchar,
      ADD COLUMN IF NOT EXISTS "legal_siret" varchar,
      ADD COLUMN IF NOT EXISTS "legal_vat_number" varchar,
      ADD COLUMN IF NOT EXISTS "legal_rcs" varchar,
      ADD COLUMN IF NOT EXISTS "legal_additional_mentions" varchar;
  `)

  await db.execute(sql`
    ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "invoice_number" numeric;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "invoice_sequences" (
      "id" serial PRIMARY KEY NOT NULL,
      "site_id" integer NOT NULL,
      "next_number" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "invoice_sequences"
        ADD CONSTRAINT "invoice_sequences_site_id_fk"
        FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "invoice_sequences_site_id_idx"
      ON "invoice_sequences" ("site_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "invoice_sequences" CASCADE;`)
  await db.execute(sql`ALTER TABLE "orders" DROP COLUMN IF EXISTS "invoice_number";`)
  await db.execute(sql`
    ALTER TABLE "sites"
      DROP COLUMN IF EXISTS "legal_company_name",
      DROP COLUMN IF EXISTS "legal_siret",
      DROP COLUMN IF EXISTS "legal_vat_number",
      DROP COLUMN IF EXISTS "legal_rcs",
      DROP COLUMN IF EXISTS "legal_additional_mentions";
  `)
}
