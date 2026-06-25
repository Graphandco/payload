import type { CollectionConfig } from 'payload'
import {
  createAssignDefaultSiteBeforeChange,
  createSiteField,
  createPublicSiteScopedCollectionAccess,
} from '../lib/siteAccess'
import { createSlugFromField } from '../lib/slug'

const siteAccess = createPublicSiteScopedCollectionAccess('categories')

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Catégorie',
    plural: 'Catégories',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: siteAccess,
  fields: [
    createSiteField(),
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
  hooks: {
    beforeValidate: [createSlugFromField('name')],
    beforeChange: [createAssignDefaultSiteBeforeChange()],
  },
}
