import type { Access, CollectionConfig } from 'payload'
import {
  ConditionalRepeaterBlock,
  FormattedTextBlock,
  GalleryBlock,
  ImageBlock,
  SimpleParagraphBlock,
  SimpleTextBlock,
} from '../blocks'
import {
  createHideWhenEmptyCreateAccess,
  createHideWhenEmptyReadAccess,
  createSiteScopedManageAccess,
  createSiteScopedReadAccess,
  getDefaultUserSiteID,
  getUserSiteIDs,
  isSuperAdmin,
} from '../lib/siteAccess'

const baseReadPages = createSiteScopedReadAccess()
const canReadPages = createHideWhenEmptyReadAccess(baseReadPages, 'pages')
const canCreatePages = createHideWhenEmptyCreateAccess('pages')
const canManagePages: Access = createSiteScopedManageAccess()

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: canReadPages,
    create: canCreatePages,
    update: canManagePages,
    delete: canManagePages,
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
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenu',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              required: true,
              blocks: [
                SimpleTextBlock,
                SimpleParagraphBlock,
                FormattedTextBlock,
                ImageBlock,
                ConditionalRepeaterBlock,
                GalleryBlock,
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seoMetaTitle',
              label: 'SEO Meta Title',
              type: 'textarea',
            },
            {
              name: 'seoMetaDescription',
              label: 'SEO Meta Description',
              type: 'textarea',
            },
          ],
        },
      ],
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
