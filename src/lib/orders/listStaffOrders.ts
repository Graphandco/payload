/**
 * Liste paginée des commandes pour /commandes (staff authentifié).
 */
import configPromise from '@payload-config'
import type { Order } from '@/payload-types'
import { formatOrderNumber } from '@/lib/formatOrderNumber'
import { formatPrice } from '@/lib/formatPrice'
import type { StaffOrdersListResult } from '@/lib/orders/staffOrderTypes'
import { getPayload } from 'payload'

const DEFAULT_ORDERS_PAGE_LIMIT = 50
const MAX_ORDERS_PAGE_LIMIT = 100

export function getOrdersPageLimit(): number {
  const raw = process.env.ORDERS_PAGE_LIMIT?.trim()
  if (!raw) {
    return DEFAULT_ORDERS_PAGE_LIMIT
  }

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_ORDERS_PAGE_LIMIT
  }

  return Math.min(parsed, MAX_ORDERS_PAGE_LIMIT)
}

function serializeStaffOrder(order: Order) {
  const total = Number(order.total)

  return {
    id: order.id,
    displayNumber: formatOrderNumber(order.orderNumber),
    customerName: order.customer.name,
    createdAt: order.createdAt,
    total,
    totalLabel: formatPrice(total),
    paymentStatus: order.paymentStatus,
    canDownloadInvoice: order.paymentStatus === 'paid',
  }
}

export async function listStaffOrders(
  siteId: number,
  page: number,
  limit: number = getOrdersPageLimit(),
): Promise<StaffOrdersListResult> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'orders',
    where: {
      site: { equals: siteId },
    },
    sort: '-createdAt',
    page,
    limit,
    depth: 0,
    overrideAccess: true,
  })

  return {
    orders: result.docs.map(serializeStaffOrder),
    page: result.page ?? page,
    limit: result.limit ?? limit,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
  }
}
