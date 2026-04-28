import type { Access, CollectionConfig } from 'payload'
import { createSlugFromField } from '../lib/slug'

const isAdmin: Access = ({ req }) => {
  return req.user?.role === 'admin'
}

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
