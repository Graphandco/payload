/**
 * Champs Payload partagés pour une période de service (midi / soir).
 */
export const servicePeriodFields = [
  {
    name: 'closed',
    label: 'Fermé',
    type: 'checkbox' as const,
    defaultValue: false,
  },
  {
    name: 'restaurantOpen',
    label: "Heure d'ouverture du restaurant",
    type: 'text' as const,
    admin: {
      condition: (_: unknown, siblingData: { closed?: boolean }) => siblingData?.closed !== true,
      description: 'Indicatif — affiché au client, ne pilote pas les créneaux.',
      placeholder: '11:30',
    },
  },
  {
    name: 'firstPickupSlot',
    label: 'Premier créneau click & collect',
    type: 'text' as const,
    admin: {
      condition: (_: unknown, siblingData: { closed?: boolean }) => siblingData?.closed !== true,
      description: 'Format 24h (ex. 11:45).',
      placeholder: '11:45',
    },
  },
  {
    name: 'restaurantClose',
    label: 'Heure de fermeture du restaurant',
    type: 'text' as const,
    admin: {
      condition: (_: unknown, siblingData: { closed?: boolean }) => siblingData?.closed !== true,
      description: 'Indicatif — affiché au client, ne pilote pas les créneaux.',
      placeholder: '14:00',
    },
  },
  {
    name: 'lastPickupSlot',
    label: 'Dernier créneau click & collect',
    type: 'text' as const,
    admin: {
      condition: (_: unknown, siblingData: { closed?: boolean }) => siblingData?.closed !== true,
      description: 'Format 24h (ex. 13:30).',
      placeholder: '13:30',
    },
  },
]
