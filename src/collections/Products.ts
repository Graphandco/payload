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
import { createSlugFromField } from '../lib/slug'

const baseReadProducts = createSiteScopedReadAccess()
const canReadProducts = createHideWhenEmptyReadAccess(baseReadProducts, 'products')
const canCreateProducts = createHideWhenEmptyCreateAccess('products')
const canManageProducts: Access = createSiteScopedManageAccess()

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Produit',
    plural: 'Produits',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: canReadProducts,
    create: canCreateProducts,
    update: canManageProducts,
    delete: canManageProducts,
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
        if (isSuperAdmin(req.user)) {
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
