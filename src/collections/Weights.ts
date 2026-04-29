import type { Access, CollectionConfig } from 'payload'
import {
  createHideWhenEmptyCreateAccess,
  createSiteScopedManageAccess,
  getDefaultUserSiteID,
  getUserSiteIDs,
  isSuperAdmin,
} from '../lib/siteAccess'

const canCreateWeights = createHideWhenEmptyCreateAccess('weights')
const canManageWeights: Access = createSiteScopedManageAccess()

export const Weights: CollectionConfig = {
  slug: 'weights',
  labels: {
    singular: 'Poids',
    plural: 'Poids',
  },
  admin: {
    useAsTitle: 'date',
  },
  access: {
    read: true,
    create: canCreateWeights,
    update: canManageWeights,
    delete: canManageWeights,
  },
  fields: [
    {
      name: 'site',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
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
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'poids',
      label: 'Poids (kg)',
      type: 'number',
      required: true,
      min: 0,
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
