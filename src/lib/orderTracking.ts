/**
 * Données publiques et libellés pour la page de suivi commande (/commande/suivi/[token]).
 */
import type { Order, Site } from '@/payload-types'
import { formatOrderNumber } from '@/lib/formatOrderNumber'
import { formatPickupSlotLabel } from '@/lib/kitchen/formatPickupSlotLabel'

const PARIS_TZ = 'Europe/Paris'

export type PublicOrderTracking = {
  displayNumber: string
  status: Order['status']
  statusLabel: string
  paymentStatus: Order['paymentStatus']
  paymentStatusLabel: string
  customerName: string
  pickupSlotLabel: string | null
  showPickupSlot: boolean
  showCountdown: boolean
  pickupAtMs: number | null
  lines: {
    name: string
    quantity: number
    lineTotal: number
  }[]
  total: number
  updatedAt: string
}

const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  in_progress: 'En préparation',
  completed: 'Prête à être récupérée',
  cancelled: 'Annulée',
}

const PAYMENT_STATUS_LABELS: Record<Order['paymentStatus'], string> = {
  pending: 'Paiement en attente',
  paid: 'Payée',
  failed: 'Paiement échoué',
  refunded: 'Remboursée',
}

function normalizeDateKey(date: string): string {
  return date.includes('T') ? date.slice(0, 10) : date
}

function getParisDateTimeMs(dateKey: string, time: string): number | null {
  const parsedDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
  const parsedTime = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (!parsedDate || !parsedTime) {
    return null
  }

  const y = Number(parsedDate[1])
  const m = Number(parsedDate[2])
  const d = Number(parsedDate[3])
  const hour = Number(parsedTime[1])
  const minute = Number(parsedTime[2])

  const utcGuess = Date.UTC(y, m - 1, d, hour - 1, minute, 0)
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: PARIS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  for (const offsetHours of [1, 2]) {
    const candidate = Date.UTC(y, m - 1, d, hour - offsetHours, minute, 0)
    const parts = formatter.formatToParts(new Date(candidate))
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value ?? 0)

    if (
      get('year') === y &&
      get('month') === m &&
      get('day') === d &&
      get('hour') === hour &&
      get('minute') === minute
    ) {
      return candidate
    }
  }

  return utcGuess
}

export function getMillisecondsUntilPickup(
  date: string,
  time: string,
  now: Date = new Date(),
): number | null {
  const dateKey = normalizeDateKey(date)
  const pickupAtMs = getParisDateTimeMs(dateKey, time)
  if (pickupAtMs === null) {
    return null
  }

  return pickupAtMs - now.getTime()
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) {
    return 'Votre créneau de retrait est arrivé'
  }

  const totalMinutes = Math.ceil(ms / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0 && minutes > 0) {
    return `Retrait dans ${hours} h ${minutes} min`
  }

  if (hours > 0) {
    return `Retrait dans ${hours} h`
  }

  return `Retrait dans ${minutes} min`
}

export function serializePublicOrderTracking(order: Order, site: Site): PublicOrderTracking {
  const tracking = site.clickAndCollect?.tracking
  const showPickupSlot = tracking?.showPickupSlot !== false
  const showCountdown = tracking?.showCountdown !== false

  const dateKey = normalizeDateKey(
    typeof order.pickupSlot.date === 'string'
      ? order.pickupSlot.date
      : new Date(order.pickupSlot.date).toISOString(),
  )

  const pickupAtMs =
    showPickupSlot && showCountdown && order.status === 'in_progress'
      ? getParisDateTimeMs(dateKey, order.pickupSlot.time)
      : null

  return {
    displayNumber: formatOrderNumber(order.orderNumber),
    status: order.status,
    statusLabel: ORDER_STATUS_LABELS[order.status],
    paymentStatus: order.paymentStatus,
    paymentStatusLabel: PAYMENT_STATUS_LABELS[order.paymentStatus],
    customerName: order.customer.name,
    pickupSlotLabel: showPickupSlot
      ? formatPickupSlotLabel(dateKey, order.pickupSlot.time)
      : null,
    showPickupSlot,
    showCountdown,
    pickupAtMs,
    lines: (order.lines ?? []).map((line) => ({
      name: line.name,
      quantity: line.quantity,
      lineTotal: line.price * line.quantity,
    })),
    total: order.total,
    updatedAt: order.updatedAt,
  }
}
