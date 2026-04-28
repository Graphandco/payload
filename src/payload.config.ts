import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { fr } from '@payloadcms/translations/languages/fr'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Sites } from './collections/Sites'
import { Pages } from './collections/Pages'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    suppressHydrationWarning: true,
    meta: {
      titleSuffix: ' - Graph & Co CMS',
      description: 'Interface CMS Graph & Co.',
    },
    dateFormat: 'd MMMM yyyy à HH:mm',
    timezones: {
      supportedTimezones: [
        {
          label: 'Europe/Paris',
          value: 'Europe/Paris',
        },
        {
          label: 'UTC',
          value: 'UTC',
        },
      ],
      defaultTimezone: 'Europe/Paris',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Sites, Users, Pages, Media, Categories, Products],
  i18n: {
    fallbackLanguage: 'fr',
    supportedLanguages: { fr },
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
