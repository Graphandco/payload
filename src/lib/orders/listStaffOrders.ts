/**
 * Liste paginée des commandes pour /commandes (staff authentifié).
 */
import configPromise from '@payload-config'
import type { Order } from '@/payload-types'
import { formatOrderNumber } from '@/lib/formatOrderNumber'
import { formatPrice } from '@/lib/formatPrice'
import { formatInvoiceNumber } from '@/lib/invoices/formatInvoiceNumber'
import type { StaffOrdersListResult } from '@/lib/orders/staffOrderTypes'
import { matchesOrderSearch } from '@/lib/orders/matchesOrderSearch'
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
    invoiceNumberLabel:
      order.invoiceNumber != null ? formatInvoiceNumber(order.invoiceNumber) : null,
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
  search?: string,
): Promise<StaffOrdersListResult> {
  const payload = await getPayload({ config: configPromise })
  const query = search?.trim()

  if (query) {
    const result = await payload.find({
      collection: 'orders',
      where: {
        site: { equals: siteId },
      },
      sort: '-createdAt',
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })

    const filtered = result.docs.filter((order) => matchesOrderSearch(order, query))
    const start = (page - 1) * limit
    const pageOrders = filtered.slice(start, start + limit)

    return {
      orders: pageOrders.map(serializeStaffOrder),
      page,
      limit,
      totalDocs: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    }
  }

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
