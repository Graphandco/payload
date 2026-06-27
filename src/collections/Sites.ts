/**
 * Collection Payload des sites (tenants) : identité, contact, horaires, click & collect.
 */
import type { Access, CollectionConfig } from 'payload'
import { normalizeSiteDomain } from '../lib/siteDomain'
import { createSlugFromField } from '../lib/slug'
import {
  createSitesAdminAccess,
  createSitesReadAccess,
  createSitesUpdateAccess,
  userIsAdmin,
} from '../lib/siteAccess'
import { WEEKDAYS } from '../lib/siteSchedule'

const isAdmin: Access = async ({ req }) => userIsAdmin(req)

const adminOnlyFieldUpdate = {
  update: async ({ req }: { req: { user?: unknown } }) => userIsAdmin(req),
}

const timeSlotFields = [
  {
    name: 'open',
    label: 'Ouverture',
    type: 'text' as const,
    required: true,
    admin: {
      description: 'Format 24h (ex. 11:30).',
      placeholder: '11:30',
    },
  },
  {
    name: 'close',
    label: 'Fermeture',
    type: 'text' as const,
    required: true,
    admin: {
      description: 'Format 24h (ex. 14:00).',
      placeholder: '14:00',
    },
  },
]

const weeklyDayFields = WEEKDAYS.map(({ label, value }) => ({
  name: value,
  label,
  type: 'group' as const,
  admin: {
    hideGutter: true,
  },
  fields: [
    {
      name: 'closed',
      label: 'Fermé',
      type: 'checkbox' as const,
      defaultValue: false,
    },
    {
      name: 'slots',
      label: 'Créneaux',
      type: 'array' as const,
      admin: {
        condition: (_: unknown, siblingData: { closed?: boolean }) => siblingData?.closed !== true,
        description: 'Ex. 11:30–14:00 et 18:00–22:00 pour le service midi et soir.',
        initCollapsed: true,
      },
      fields: timeSlotFields,
    },
  ],
}))

export const Sites: CollectionConfig = {
  slug: 'sites',
  labels: {
    singular: 'Site',
    plural: 'Sites',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'domain', 'updatedAt'],
  },
  access: {
    read: createSitesReadAccess(),
    create: isAdmin,
    update: createSitesUpdateAccess(),
    delete: isAdmin,
    admin: createSitesAdminAccess(),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Général',
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
              access: adminOnlyFieldUpdate,
              admin: {
                description:
                  'Identifiant technique du site. En dev, le domaine local sera {slug}.localhost.',
              },
            },
            {
              name: 'domain',
              label: 'Domaine',
              type: 'text',
              unique: true,
              access: adminOnlyFieldUpdate,
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
                condition: (data) =>
                  !data?.domain && typeof data?.slug === 'string' && data.slug.length > 0,
                components: {
                  Field: '@/components/admin/SiteDevDomainPreview#SiteDevDomainPreview',
                },
              },
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'contact',
              type: 'group',
              fields: [
                {
                  name: 'email',
                  label: 'Email',
                  type: 'email',
                },
                {
                  name: 'phone',
                  label: 'Téléphone',
                  type: 'text',
                },
                {
                  name: 'street',
                  label: 'Adresse',
                  type: 'text',
                  admin: {
                    placeholder: '12 rue de la Paix',
                  },
                },
                {
                  name: 'postalCode',
                  label: 'Code postal',
                  type: 'text',
                  admin: {
                    placeholder: '67000',
                  },
                },
                {
                  name: 'city',
                  label: 'Ville',
                  type: 'text',
                  admin: {
                    placeholder: 'Strasbourg',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Horaires',
          fields: [
            {
              name: 'schedule',
              type: 'group',
              fields: [
                {
                  name: 'weeklyHours',
                  label: 'Horaires hebdomadaires',
                  type: 'group',
                  admin: {
                    description:
                      "Un bloc par jour. Cochez « Fermé » pour fermer le lundi (ou tout autre jour) sans créneau.",
                  },
                  fields: weeklyDayFields,
                },
                {
                  name: 'exceptions',
                  label: 'Jours particuliers',
                  type: 'array',
                  admin: {
                    description:
                      'Fermetures ou horaires spéciaux (Noël, congés…). Pas de jours fériés automatiques.',
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'startDate',
                      label: 'Date de début',
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
                      name: 'endDate',
                      label: 'Date de fin',
                      type: 'date',
                      admin: {
                        description: 'Laisser vide pour un jour unique.',
                        date: {
                          pickerAppearance: 'dayOnly',
                          displayFormat: 'd MMM yyyy',
                        },
                      },
                    },
                    {
                      name: 'type',
                      label: 'Type',
                      type: 'select',
                      required: true,
                      defaultValue: 'closed',
                      options: [
                        { label: 'Fermé', value: 'closed' },
                        { label: 'Horaires spéciaux', value: 'custom_hours' },
                      ],
                    },
                    {
                      name: 'label',
                      label: 'Libellé',
                      type: 'text',
                      admin: {
                        placeholder: 'Noël, congés annuels…',
                      },
                    },
                    {
                      name: 'note',
                      label: 'Message client',
                      type: 'textarea',
                      admin: {
                        description: 'Affiché sur la carte / commande si ce jour est concerné.',
                      },
                    },
                    {
                      name: 'customHours',
                      label: 'Horaires spéciaux',
                      type: 'array',
                      admin: {
                        condition: (_, siblingData) => siblingData?.type === 'custom_hours',
                      },
                      fields: timeSlotFields,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Click & collect',
          fields: [
            {
              name: 'clickAndCollect',
              type: 'group',
              fields: [
                {
                  name: 'enabledBySchedule',
                  label: 'Respecter les horaires',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description:
                      'Si activé, le click & collect suit les horaires (hebdo + exceptions) en mode automatique.',
                  },
                },
                {
                  name: 'manualStatus',
                  label: 'Statut manuel',
                  type: 'select',
                  defaultValue: 'auto',
                  options: [
                    { label: 'Automatique (horaires)', value: 'auto' },
                    { label: 'Ouvert', value: 'open' },
                    { label: 'Fermé', value: 'closed' },
                  ],
                  admin: {
                    description:
                      'Prioritaire sur les horaires. Utile pour couper ou rouvrir le service immédiatement.',
                  },
                },
                {
                  name: 'minLeadTimeMinutes',
                  label: 'Délai minimum (minutes)',
                  type: 'number',
                  defaultValue: 30,
                  min: 0,
                  admin: {
                    description: 'Temps de préparation avant le premier créneau proposable.',
                  },
                },
                {
                  name: 'slotDurationMinutes',
                  label: "Durée d'un créneau (minutes)",
                  type: 'select',
                  defaultValue: '30',
                  options: [
                    { label: '15 min', value: '15' },
                    { label: '30 min', value: '30' },
                    { label: '45 min', value: '45' },
                    { label: '60 min', value: '60' },
                  ],
                },
                {
                  name: 'maxOrdersPerSlot',
                  label: 'Commandes max par créneau',
                  type: 'number',
                  min: 1,
                  admin: {
                    description: 'Optionnel. Limite le nombre de commandes par créneau de retrait.',
                  },
                },
                {
                  name: 'lastPickupSlotTime',
                  label: 'Dernier créneau de retrait',
                  type: 'text',
                  admin: {
                    description:
                      'Optionnel. Format 24h (ex. 21:30). Dernier créneau proposable ; la fermeture peut être plus tard (ex. 22:00).',
                    placeholder: '21:30',
                  },
                },
                {
                  name: 'sameDayOnly',
                  label: 'Commandes le jour même uniquement',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description:
                      'Si activé, seuls les créneaux du jour en cours sont proposés (pas de commande pour le lendemain).',
                  },
                },
                {
                  name: 'tracking',
                  label: 'Page de suivi commande',
                  type: 'group',
                  fields: [
                    {
                      name: 'showPickupSlot',
                      label: 'Afficher le créneau choisi',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                    {
                      name: 'showCountdown',
                      label: 'Afficher le compte à rebours',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [createSlugFromField('name')],
  },
}
