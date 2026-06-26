/**
 * Compteur interne par site pour attribuer un numéro de commande séquentiel (#0001, #0002…).
 * Géré automatiquement par createOrder — visible en admin pour le debug uniquement.
 */
import type { CollectionConfig } from 'payload'
import { userIsAdmin } from '../lib/siteAccess'

const adminOnly: CollectionConfig['access'] = {
  read: async ({ req }) => userIsAdmin(req),
  create: async ({ req }) => userIsAdmin(req),
  update: async ({ req }) => userIsAdmin(req),
  delete: async ({ req }) => userIsAdmin(req),
}

export const OrderSequences: CollectionConfig = {
  slug: 'order-sequences',
  labels: {
    singular: 'Séquence commande',
    plural: 'Séquences commandes',
  },
  admin: {
    useAsTitle: 'id',
    hidden: ({ user }) => user?.role !== 'admin',
    description: 'Compteur interne par site pour les numéros de commande.',
  },
  access: adminOnly,
  fields: [
    {
      name: 'site',
      label: 'Site',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      unique: true,
    },
    {
      name: 'nextNumber',
      label: 'Prochain numéro',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
      },
    },
  ],
}
