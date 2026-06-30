/**
 * Collection Payload des commandes click & collect.
 * Création publique via POST /api/orders ; lecture / mise à jour réservées aux éditeurs du site.
 */
import type { CollectionConfig } from 'payload'
import {
  createHideWhenEmptyAdminAccess,
  createSiteScopedManageAccess,
  createSiteScopedReadAccess,
  userIsAdmin,
} from '../lib/siteAccess'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Commande',
    plural: 'Commandes',
  },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'site', 'status', 'paymentStatus', 'pickupSlot', 'createdAt'],
  },
  access: {
    read: createSiteScopedReadAccess('site'),
    create: () => false,
    update: createSiteScopedManageAccess('site'),
    delete: async ({ req }) => userIsAdmin(req),
    admin: createHideWhenEmptyAdminAccess('orders', 'site'),
  },
  fields: [
    {
      name: 'site',
      label: 'Site',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      index: true,
    },
    {
      name: 'orderNumber',
      label: 'N° commande',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      label: 'Statut',
      type: 'select',
      required: true,
      defaultValue: 'in_progress',
      options: [
        { label: 'En cours', value: 'in_progress' },
        { label: 'Terminée', value: 'completed' },
        { label: 'Annulée', value: 'cancelled' },
      ],
    },
    {
      name: 'paymentStatus',
      label: 'Paiement',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'En attente', value: 'pending' },
        { label: 'Payée', value: 'paid' },
        { label: 'Échouée', value: 'failed' },
        { label: 'Remboursée', value: 'refunded' },
      ],
    },
    {
      name: 'molliePaymentId',
      label: 'ID paiement Mollie',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'confirmationEmailSent',
      label: 'E-mail de confirmation envoyé',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Passé à true après envoi Brevo de la confirmation client (paiement validé).',
      },
    },
    {
      name: 'customer',
      label: 'Client',
      type: 'group',
      fields: [
        {
          name: 'name',
          label: 'Nom',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
        },
        {
          name: 'phone',
          label: 'Téléphone',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'pickupSlot',
      label: 'Créneau de retrait',
      type: 'group',
      fields: [
        {
          name: 'value',
          label: 'Valeur',
          type: 'text',
          required: true,
        },
        {
          name: 'date',
          label: 'Date',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyyy',
            },
          },
        },
        {
          name: 'time',
          label: 'Heure',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'lines',
      label: 'Articles',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'product',
          label: 'Produit',
          type: 'relationship',
          relationTo: 'products',
        },
        {
          name: 'name',
          label: 'Nom',
          type: 'text',
          required: true,
        },
        {
          name: 'price',
          label: 'Prix unitaire',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'quantity',
          label: 'Quantité',
          type: 'number',
          required: true,
          min: 1,
        },
      ],
    },
    {
      name: 'total',
      label: 'Total',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'trackingToken',
      label: 'Token de suivi',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
  ],
}
