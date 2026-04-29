import type { Access, CollectionConfig } from 'payload'
import {
  buildSiteScopedConstraint,
  createHideWhenEmptyCreateAccess,
  createSiteScopedManageAccess,
  getDefaultUserSiteID,
  getUserSiteIDs,
  isAdminUser,
  isSuperAdmin,
} from '../lib/siteAccess'

const canReadMediaPublicButScopedForUsers: Access = ({ req }) => {
  if (!req.user) {
    return true
  }

  if (isSuperAdmin(req.user) || isAdminUser(req.user)) {
    return true
  }

  const siteIDs = getUserSiteIDs(req.user)
  if (siteIDs.length === 0) {
    return false
  }

  return buildSiteScopedConstraint(siteIDs, 'site')
}

const canCreateMedia = createHideWhenEmptyCreateAccess('media')
const canManageMedia: Access = createSiteScopedManageAccess()

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: canReadMediaPublicButScopedForUsers,
    create: canCreateMedia,
    update: canManageMedia,
    delete: canManageMedia,
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
      name: 'alt',
      type: 'text',
    },
  ],
  upload: true,
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
