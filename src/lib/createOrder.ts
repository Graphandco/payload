/**
 * Création d'une commande côté serveur : validation (panier, créneau, C&C),
 * numérotation, persistance dans la collection orders.
 */
import configPromise from '@payload-config'
import type { Order, Product, Site } from '@/payload-types'
import { createOrderRequestSchema, type CreateOrderRequest } from './createOrderRequestSchema'
import { formatOrderNumber } from './formatOrderNumber'
import { getAvailablePickupSlots, type PickupSlot } from './pickupSlots'
import { getParisDateKey } from './siteSchedule'
import { isClickAndCollectManuallyClosed } from '@/lib/clickAndCollectStatus'
import { getPayload } from 'payload'
import { randomUUID } from 'crypto'

export type CreateOrderResult = {
  id: number
  orderNumber: number
  displayNumber: string
  trackingToken: string
  total: number
  pickupLabel: string
}

export type CreateOrderErrorCode =
  | 'INVALID_BODY'
  | 'SITE_NOT_FOUND'
  | 'CLICK_AND_COLLECT_CLOSED'
  | 'INVALID_PICKUP_SLOT'
  | 'SLOT_FULL'
  | 'INVALID_LINES'
  | 'EMPTY_CART'

export class CreateOrderError extends Error {
  code: CreateOrderErrorCode

  constructor(code: CreateOrderErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

function parsePickupSlotValue(value: string): { date: string; time: string } | null {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(value)
  if (!match) {
    return null
  }

  return {
    date: match[1],
    time: match[2],
  }
}

function isSlotAvailable(slots: PickupSlot[], value: string): boolean {
  return slots.some((slot) => slot.value === value)
}

async function getNextOrderNumber(payload: Awaited<ReturnType<typeof getPayload>>, siteId: number) {
  const existing = await payload.find({
    collection: 'order-sequences',
    where: {
      site: { equals: siteId },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const sequence = existing.docs[0]

  if (sequence) {
    const nextNumber = (sequence.nextNumber ?? 0) + 1
    await payload.update({
      collection: 'order-sequences',
      id: sequence.id,
      data: {
        nextNumber,
      },
      overrideAccess: true,
    })
    return nextNumber
  }

  await payload.create({
    collection: 'order-sequences',
    data: {
      site: siteId,
      nextNumber: 1,
    },
    overrideAccess: true,
  })

  return 1
}

async function countOrdersForSlot(
  payload: Awaited<ReturnType<typeof getPayload>>,
  siteId: number,
  pickupSlotValue: string,
): Promise<number> {
  const result = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { site: { equals: siteId } },
        { 'pickupSlot.value': { equals: pickupSlotValue } },
        { status: { not_equals: 'cancelled' } },
      ],
    },
    limit: 0,
    pagination: true,
    overrideAccess: true,
  })

  return result.totalDocs
}

async function resolveOrderLines(
  payload: Awaited<ReturnType<typeof getPayload>>,
  siteId: number,
  lines: CreateOrderRequest['lines'],
): Promise<{ lines: Order['lines']; total: number }> {
  const productIds = [...new Set(lines.map((line) => line.productId))]

  const productsResult = await payload.find({
    collection: 'products',
    where: {
      and: [{ site: { equals: siteId } }, { id: { in: productIds } }],
    },
    limit: productIds.length,
    depth: 0,
    overrideAccess: true,
  })

  const productsById = new Map<number, Product>(
    productsResult.docs.map((product) => [product.id, product]),
  )

  const orderLines: NonNullable<Order['lines']> = []
  let total = 0

  for (const line of lines) {
    const product = productsById.get(line.productId)
    if (!product) {
      throw new CreateOrderError('INVALID_LINES', 'Produit invalide ou indisponible.')
    }

    const lineTotal = product.price * line.quantity
    total += lineTotal

    orderLines.push({
      product: product.id,
      name: product.name,
      price: product.price,
      quantity: line.quantity,
    })
  }

  if (orderLines.length === 0) {
    throw new CreateOrderError('EMPTY_CART', 'Le panier est vide.')
  }

  return { lines: orderLines, total }
}

export async function createOrder(input: unknown): Promise<CreateOrderResult> {
  const parsed = createOrderRequestSchema.safeParse(input)
  if (!parsed.success) {
    throw new CreateOrderError('INVALID_BODY', 'Données de commande invalides.')
  }

  const data = parsed.data
  const payload = await getPayload({ config: configPromise })

  const siteResult = await payload.find({
    collection: 'sites',
    where: { id: { equals: data.siteId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const site = siteResult.docs[0] as Site | undefined
  if (!site) {
    throw new CreateOrderError('SITE_NOT_FOUND', 'Site introuvable.')
  }

  if (isClickAndCollectManuallyClosed(site)) {
    throw new CreateOrderError('CLICK_AND_COLLECT_CLOSED', 'Click & collect fermé pour le moment.')
  }

  const availableSlots = getAvailablePickupSlots(site)
  if (!isSlotAvailable(availableSlots, data.pickupSlot)) {
    throw new CreateOrderError('INVALID_PICKUP_SLOT', 'Créneau invalide ou plus disponible.')
  }

  const parsedSlot = parsePickupSlotValue(data.pickupSlot)
  if (!parsedSlot) {
    throw new CreateOrderError('INVALID_PICKUP_SLOT', 'Créneau invalide.')
  }

  if (parsedSlot.date !== getParisDateKey()) {
    throw new CreateOrderError(
      'INVALID_PICKUP_SLOT',
      'Seuls les créneaux du jour même sont acceptés.',
    )
  }

  const maxPerSlot = site.clickAndCollect?.maxOrdersPerSlot
  if (typeof maxPerSlot === 'number' && maxPerSlot > 0) {
    const count = await countOrdersForSlot(payload, site.id, data.pickupSlot)
    if (count >= maxPerSlot) {
      throw new CreateOrderError('SLOT_FULL', 'Ce créneau est complet.')
    }
  }

  const { lines, total } = await resolveOrderLines(payload, site.id, data.lines)
  const orderNumber = await getNextOrderNumber(payload, site.id)
  const trackingToken = randomUUID()
  const pickupLabel =
    availableSlots.find((slot) => slot.value === data.pickupSlot)?.label ?? data.pickupSlot

  const order = await payload.create({
    collection: 'orders',
    data: {
      site: site.id,
      orderNumber,
      status: 'in_progress',
      paymentStatus: 'pending',
      customer: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
      pickupSlot: {
        value: data.pickupSlot,
        date: parsedSlot.date,
        time: parsedSlot.time,
      },
      lines,
      total,
      trackingToken,
    },
    overrideAccess: true,
  })

  return {
    id: order.id,
    orderNumber,
    displayNumber: formatOrderNumber(orderNumber),
    trackingToken,
    total,
    pickupLabel,
  }
}
