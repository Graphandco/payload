/**
 * Lecture et mise à jour des commandes pour l'écran cuisine.
 */
import configPromise from '@payload-config'
import type { Order } from '@/payload-types'
import { formatOrderNumber } from '@/lib/formatOrderNumber'
import { formatPickupSlotLabel } from '@/lib/kitchen/formatPickupSlotLabel'
import type { KitchenOrder } from '@/lib/kitchen/kitchenOrderTypes'
import { getPayload } from 'payload'

export type KitchenOrderErrorCode = 'NOT_FOUND' | 'INVALID_STATUS' | 'INVALID_BODY'

export class KitchenOrderError extends Error {
  code: KitchenOrderErrorCode

  constructor(code: KitchenOrderErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

function getSiteIdFromOrder(order: Order): number {
  return typeof order.site === 'object' && order.site !== null ? order.site.id : order.site
}

function serializeKitchenOrder(order: Order): KitchenOrder {
  const date =
    typeof order.pickupSlot.date === 'string'
      ? order.pickupSlot.date
      : new Date(order.pickupSlot.date).toISOString()

  return {
    id: order.id,
    displayNumber: formatOrderNumber(order.orderNumber),
    status: order.status,
    paymentStatus: order.paymentStatus,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    pickupSlotValue: order.pickupSlot.value,
    pickupSlotLabel: formatPickupSlotLabel(date, order.pickupSlot.time),
    lines: (order.lines ?? []).map((line) => ({
      name: line.name,
      quantity: line.quantity,
    })),
    total: order.total,
    createdAt: order.createdAt,
  }
}

function sortOrdersByPickupSlot(orders: KitchenOrder[]): KitchenOrder[] {
  return [...orders].sort((a, b) => {
    const dateCompare = a.pickupSlotValue.localeCompare(b.pickupSlotValue)
    if (dateCompare !== 0) {
      return dateCompare
    }

    return a.createdAt.localeCompare(b.createdAt)
  })
}

export async function listKitchenOrders(siteId: number): Promise<KitchenOrder[]> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'orders',
    where: {
      and: [{ site: { equals: siteId } }, { status: { equals: 'in_progress' } }],
    },
    limit: 200,
    depth: 0,
    // Sans req.user tant que requireKitchenAccess n'est pas branché sur payload.auth
    overrideAccess: true,
  })

  return sortOrdersByPickupSlot(result.docs.map(serializeKitchenOrder))
}

export async function updateKitchenOrderStatus(
  siteId: number,
  orderId: number,
  status: 'completed' | 'cancelled',
): Promise<KitchenOrder> {
  const payload = await getPayload({ config: configPromise })

  let existing: Order
  try {
    existing = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 0,
      overrideAccess: true,
    })
  } catch {
    throw new KitchenOrderError('NOT_FOUND', 'Commande introuvable.')
  }

  if (getSiteIdFromOrder(existing) !== siteId) {
    throw new KitchenOrderError('NOT_FOUND', 'Commande introuvable.')
  }

  if (existing.status !== 'in_progress') {
    throw new KitchenOrderError('INVALID_STATUS', 'Cette commande n’est plus modifiable.')
  }

  const updated = await payload.update({
    collection: 'orders',
    id: orderId,
    data: { status },
    depth: 0,
    overrideAccess: true,
  })

  return serializeKitchenOrder(updated)
}
