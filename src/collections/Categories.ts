import type { Access, CollectionConfig } from 'payload'
import {
  createHideWhenEmptyCreateAccess,
  createHideWhenEmptyReadAccess,
  createSiteScopedManageAccess,
  createSiteScopedReadAccess,
  getDefaultUserSiteID,
  getUserSiteIDs,
  isSuperAdmin,
} from '../lib/siteAccess'

const baseReadCategories = createSiteScopedReadAccess()
const canReadCategories = createHideWhenEmptyReadAccess(baseReadCategories, 'categories')
const canCreateCategories = createHideWhenEmptyCreateAccess('categories')
const canManageCategories: Access = createSiteScopedManageAccess()

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
      access: {
        read: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        condition: (_, __, { user }) => isSuperAdmin(user),
      },
      filterOptions: ({ req }) => {
        if (isSuperAdmin(req.user)) {
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
    beforeChange: [
      ({ req, data }) => {
        if (isSuperAdmin(req.user)) {
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
