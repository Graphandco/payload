import type { CollectionConfig } from 'payload'
import {
  createAssignDefaultSiteBeforeChange,
  createSiteField,
  createPublicSiteScopedCollectionAccess,
  getUserSiteIDs,
  isAdminUser,
} from '../lib/siteAccess'
import { createSlugFromField } from '../lib/slug'

const siteAccess = createPublicSiteScopedCollectionAccess('products')

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Produit',
    plural: 'Produits',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: siteAccess,
  fields: [
    createSiteField(),
    {
      name: 'name',
      label: 'Nom',
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
      name: 'price',
      label: 'Prix (€)',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Catégories réutilisables (produits, blog, etc.).',
      },
      filterOptions: ({ req, siblingData }) => {
        const data = siblingData as { site?: number | { id: number } | null }
        const productSiteId =
          typeof data?.site === 'object' && data.site !== null ? data.site.id : data?.site

        if (productSiteId) {
          return {
            site: {
              equals: productSiteId,
            },
          }
        }

        if (isAdminUser(req.user)) {
          return true
        }

        const siteIDs = getUserSiteIDs(req.user)
        if (siteIDs.length === 0) {
          return false
        }

        return {
          site: {
            in: siteIDs,
          },
        }
      },
    },
    {
      name: 'featuredImage',
      label: 'Image principale',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  hooks: {
    beforeValidate: [createSlugFromField('name')],
    beforeChange: [createAssignDefaultSiteBeforeChange()],
  },
}
