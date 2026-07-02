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
import { servicePeriodFields } from '../lib/servicePeriodFields'

const isAdmin: Access = async ({ req }) => userIsAdmin(req)

const adminOnlyFieldUpdate = {
  update: async ({ req }: { req: { user?: unknown } }) => userIsAdmin(req),
}

const weeklyDayFields = WEEKDAYS.flatMap(({ label, value }) => [
  {
    name: `${value}Lunch`,
    label: `${label} midi`,
    type: 'group' as const,
    admin: {
      hideGutter: true,
    },
    fields: servicePeriodFields,
  },
  {
    name: `${value}Evening`,
    label: `${label} soir`,
    type: 'group' as const,
    admin: {
      hideGutter: true,
    },
    fields: servicePeriodFields,
  },
])

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
              name: 'logo',
              label: 'Logo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'SVG, PNG ou JPG. Affiché dans l’en-tête à gauche du nom du site.',
              },
              filterOptions: ({ id }) => {
                if (!id) {
                  return true
                }

                return {
                  site: {
                    equals: id,
                  },
                }
              },
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
                description: 'Exemple : youclickyoucollect.fr',
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
            {
              name: 'legal',
              label: 'Mentions légales',
              type: 'group',
              admin: {
                description:
                  'Informations pour les pages légales du site et le pied des factures PDF.',
              },
              fields: [
                {
                  name: 'companyName',
                  label: 'Raison sociale',
                  type: 'text',
                  admin: {
                    placeholder: 'SARL Graph and Co',
                  },
                },
                {
                  name: 'legalRepresentative',
                  label: 'Représentant légal',
                  type: 'text',
                  admin: {
                    description:
                      'Affiché dans les mentions légales (et directeur de la publication si non précisé ailleurs).',
                    placeholder: 'M. Jean Dupont',
                  },
                },
                {
                  name: 'siret',
                  label: 'SIRET',
                  type: 'text',
                  admin: {
                    placeholder: '123 456 789 00012',
                  },
                },
                {
                  name: 'vatNumber',
                  label: 'N° TVA intracommunautaire',
                  type: 'text',
                  admin: {
                    placeholder: 'FR12345678901',
                  },
                },
                {
                  name: 'rcs',
                  label: 'RCS / RM',
                  type: 'text',
                  admin: {
                    placeholder: 'RCS Strasbourg B 123 456 789',
                  },
                },
                {
                  name: 'additionalMentions',
                  label: 'Mentions complémentaires',
                  type: 'textarea',
                  admin: {
                    description: 'Texte libre en bas de facture (capital social, etc.).',
                  },
                },
              ],
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
                      'Midi et soir pour chaque jour. Les horaires restaurant sont indicatifs ; les créneaux click & collect pilotent les commandes.',
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
                    components: {
                      RowLabel:
                        '@/components/admin/ScheduleExceptionRowLabel#ScheduleExceptionRowLabel',
                    },
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
                      name: 'periods',
                      label: 'Périodes',
                      type: 'array',
                      admin: {
                        condition: (_, siblingData) => siblingData?.type === 'custom_hours',
                        description: 'Même structure que les horaires hebdomadaires (midi / soir).',
                      },
                      fields: servicePeriodFields,
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
                  name: 'manualStatus',
                  label: 'Statut manuel',
                  type: 'select',
                  defaultValue: 'auto',
                  options: [
                    { label: 'Automatique', value: 'auto' },
                    { label: 'Ouvert', value: 'open' },
                    { label: 'Fermé', value: 'closed' },
                  ],
                  admin: {
                    description:
                      'Coupe ou rouvre le click & collect immédiatement, indépendamment des créneaux.',
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
                  name: 'mollieApiKey',
                  label: 'Clé API Mollie',
                  type: 'text',
                  access: adminOnlyFieldUpdate,
                  admin: {
                    description:
                      'Clé API Mollie du site (test_… en dev, live_… en prod). Active le paiement en ligne au checkout.',
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
