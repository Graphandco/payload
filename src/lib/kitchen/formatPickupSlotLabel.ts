/**
 * Libellé affiché pour un créneau de retrait (fuseau Europe/Paris).
 */
export function formatPickupSlotLabel(date: string, time: string): string {
  const normalizedDate = date.includes('T') ? date : `${date}T12:00:00.000Z`
  const parsed = new Date(normalizedDate)

  const dateLabel = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Paris',
  }).format(parsed)

  return `${dateLabel} à ${time}`
}
