import type { Access, CollectionConfig } from 'payload'
import { getDevDomainFromSlug, normalizeSiteDomain } from '../lib/siteDomain'
import { createSlugFromField } from '../lib/slug'
import {
  createSitesAdminAccess,
  createSitesReadAccess,
  userIsAdmin,
} from '../lib/siteAccess'

const isAdmin: Access = async ({ req }) => userIsAdmin(req)

export const Sites: CollectionConfig = {
  slug: 'sites',
  labels: {
    singular: 'Site',
    plural: 'Sites',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: createSitesReadAccess(),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    admin: createSitesAdminAccess(),
  },
  fields: [
    {
      name: 'name',
      label: 'Nom',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Identifiant technique du site. En dev, le domaine local sera {slug}.localhost.',
      },
    },
    {
      name: 'domain',
      label: 'Domaine',
      type: 'text',
      unique: true,
      admin: {
        description:
          'Domaine custom en production (ex. pizzeria-mamma.fr). Optionnel en dev : si vide, {slug}.localhost est utilisé.',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (typeof value !== 'string' || value.trim().length === 0) {
              return value
            }

            return normalizeSiteDomain(value)
          },
        ],
      },
    },
    {
      name: 'devDomainPreview',
      type: 'ui',
      admin: {
        disableListColumn: true,
        condition: (data) => !data?.domain && typeof data?.slug === 'string' && data.slug.length > 0,
        components: {
          Field: '@/components/admin/SiteDevDomainPreview#SiteDevDomainPreview',
        },
      },
    },
  ],
  hooks: {
    beforeValidate: [createSlugFromField('name')],
  },
}
