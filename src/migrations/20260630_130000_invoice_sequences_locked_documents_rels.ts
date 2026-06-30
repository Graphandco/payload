/**
 * Migration : colonne invoice_sequences_id dans payload_locked_documents_rels
 * (verrouillage document admin Payload pour la collection invoice-sequences).
 */
import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "invoice_sequences_id" integer;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_invoice_sequences_id_idx"
      ON "payload_locked_documents_rels" USING btree ("invoice_sequences_id");
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_invoice_sequences_fk"
        FOREIGN KEY ("invoice_sequences_id") REFERENCES "public"."invoice_sequences"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_invoice_sequences_fk";
  `)

  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_invoice_sequences_id_idx";
  `)

  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "invoice_sequences_id";
  `)
}
