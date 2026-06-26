import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description" varchar;

    ALTER TABLE "categories"
      ALTER COLUMN "description" TYPE jsonb
      USING CASE
        WHEN "description" IS NULL OR btrim("description"::text) = '' THEN NULL
        WHEN left(btrim("description"::text), 1) = '{' THEN "description"::jsonb
        ELSE jsonb_build_object(
          'root',
          jsonb_build_object(
            'type', 'root',
            'version', 1,
            'direction', 'ltr',
            'format', '',
            'indent', 0,
            'children', jsonb_build_array(
              jsonb_build_object(
                'type', 'paragraph',
                'version', 1,
                'direction', 'ltr',
                'format', '',
                'indent', 0,
                'textFormat', 0,
                'textStyle', '',
                'children', jsonb_build_array(
                  jsonb_build_object(
                    'type', 'text',
                    'version', 1,
                    'text', "description"::text,
                    'detail', 0,
                    'format', 0,
                    'mode', 'normal',
                    'style', ''
                  )
                )
              )
            )
          )
        )
      END;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "description";

    ALTER TABLE "categories"
      ALTER COLUMN "description" TYPE varchar
      USING "description"::text;
  `)
}
