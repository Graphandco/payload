import type { CollectionConfig } from 'payload'
import {
  createAssignDefaultSiteBeforeChange,
  createSiteField,
  createPublicSiteScopedCollectionAccess,
} from '../lib/siteAccess'

const siteAccess = createPublicSiteScopedCollectionAccess('media')

export const Media: CollectionConfig = {
  slug: 'media',
  access: siteAccess,
  fields: [
    createSiteField(),
    {
      name: 'alt',
      type: 'text',
    },
  ],
  upload: true,
  hooks: {
    beforeChange: [createAssignDefaultSiteBeforeChange()],
  },
}
