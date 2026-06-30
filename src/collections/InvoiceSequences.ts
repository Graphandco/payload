/**
 * Compteur interne par site pour les numéros de facture (F-0001, F-0002…).
 */
import type { CollectionConfig } from 'payload'
import { userIsAdmin } from '../lib/siteAccess'

const adminOnly: CollectionConfig['access'] = {
  read: async ({ req }) => userIsAdmin(req),
  create: async ({ req }) => userIsAdmin(req),
  update: async ({ req }) => userIsAdmin(req),
  delete: async ({ req }) => userIsAdmin(req),
}

export const InvoiceSequences: CollectionConfig = {
  slug: 'invoice-sequences',
  labels: {
    singular: 'Séquence facture',
    plural: 'Séquences factures',
  },
  admin: {
    useAsTitle: 'id',
    hidden: ({ user }) => user?.role !== 'admin',
    description: 'Compteur interne par site pour les numéros de facture.',
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
