/**
 * Migration : colonnes orders_id et order_sequences_id dans payload_locked_documents_rels
 * (verrouillage document admin Payload pour les collections commandes).
 */
import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "orders_id" integer,
      ADD COLUMN IF NOT EXISTS "order_sequences_id" integer;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_orders_id_idx"
      ON "payload_locked_documents_rels" USING btree ("orders_id");
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_sequences_id_idx"
      ON "payload_locked_documents_rels" USING btree ("order_sequences_id");
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_orders_fk"
        FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_order_sequences_fk"
        FOREIGN KEY ("order_sequences_id") REFERENCES "public"."order_sequences"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_orders_fk",
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_order_sequences_fk";
  `)

  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_orders_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_order_sequences_id_idx";
  `)

  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "orders_id",
      DROP COLUMN IF EXISTS "order_sequences_id";
  `)
}
