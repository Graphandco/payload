import type { Access, CollectionConfig } from 'payload'
import { createSlugFromField } from '../lib/slug'
import { userIsAdmin } from '../lib/siteAccess'

const isAdmin: Access = async ({ req }) => userIsAdmin(req)

export const Sites: CollectionConfig = {
  slug: 'sites',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
    },
  ],
  hooks: {
    beforeValidate: [createSlugFromField('name')],
  },
}
