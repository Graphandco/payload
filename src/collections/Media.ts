import type { CollectionConfig } from 'payload'
import {
  createAssignDefaultSiteBeforeChange,
  createSiteField,
  createSiteScopedCollectionAccess,
} from '../lib/siteAccess'

const siteAccess = createSiteScopedCollectionAccess('media')

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
