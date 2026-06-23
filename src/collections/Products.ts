import type { CollectionConfig } from 'payload'
import {
  createAssignDefaultSiteBeforeChange,
  createSiteField,
  createSiteScopedCollectionAccess,
  getUserSiteIDs,
  isAdminUser,
} from '../lib/siteAccess'
import { createSlugFromField } from '../lib/slug'

const siteAccess = createSiteScopedCollectionAccess('products')

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
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Catégories réutilisables (produits, blog, etc.).',
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
          site: {
            in: siteIDs,
          },
        }
      },
    },
    {
      name: 'quantity',
      label: 'Quantité',
      type: 'number',
      defaultValue: 1,
      required: true,
      min: 1,
    },
    {
      name: 'is_to_buy',
      label: 'À acheter',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'is_in_cart',
      label: 'Dans le panier',
      type: 'checkbox',
      defaultValue: false,
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
