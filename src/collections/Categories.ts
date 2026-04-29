import type { Access, CollectionConfig } from 'payload'
import {
  createHideWhenEmptyCreateAccess,
  createSiteScopedManageAccess,
  getDefaultUserSiteID,
  getUserSiteIDs,
  isAdminUser,
} from '../lib/siteAccess'
import { createSlugFromField } from '../lib/slug'

const canCreateCategories = createHideWhenEmptyCreateAccess('categories')
const canManageCategories: Access = createSiteScopedManageAccess()
const canReadCategories: Access = () => true

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Catégorie',
    plural: 'Catégories',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: canReadCategories,
    create: canCreateCategories,
    update: canManageCategories,
    delete: canManageCategories,
  },
  fields: [
    {
      name: 'site',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      admin: {
        condition: (_, __, { user }) => isAdminUser(user),
      },
      filterOptions: ({ req }) => {
        if (isAdminUser(req.user)) {
          return true
        }

        const siteIDs = getUserSiteIDs(req.user)
        if (siteIDs.length === 0) {
          return false
        }

        return {
          id: {
            in: siteIDs,
          },
        }
      },
    },
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
    beforeChange: [
      ({ req, data }) => {
        if (isAdminUser(req.user)) {
          return data
        }

        const defaultSiteID = getDefaultUserSiteID(req.user)
        if (!defaultSiteID) {
          throw new Error('No site is assigned to your user.')
        }

        return {
          ...data,
          site: defaultSiteID,
        }
      },
    ],
  },
}
