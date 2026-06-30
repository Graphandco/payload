/**
 * Charge une commande payée + site pour génération de facture PDF.
 */
import configPromise from '@payload-config'
import type { Order, Site } from '@/payload-types'
import { getPayload } from 'payload'

export class InvoiceOrderError extends Error {
  code: 'NOT_FOUND' | 'NOT_PAID'

  constructor(code: 'NOT_FOUND' | 'NOT_PAID', message: string) {
    super(message)
    this.code = code
  }
}

export type InvoiceOrderContext = {
  order: Order
  site: Pick<Site, 'name' | 'contact' | 'legal'>
}

function getSiteIdFromOrder(order: Order): number {
  return typeof order.site === 'object' && order.site !== null ? order.site.id : order.site
}

export async function loadInvoiceOrderContext(
  siteId: number,
  orderId: number,
): Promise<InvoiceOrderContext> {
  const payload = await getPayload({ config: configPromise })

  let order: Order
  try {
    order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 1,
      overrideAccess: true,
    })
  } catch {
    throw new InvoiceOrderError('NOT_FOUND', 'Commande introuvable.')
  }

  if (getSiteIdFromOrder(order) !== siteId) {
    throw new InvoiceOrderError('NOT_FOUND', 'Commande introuvable.')
  }

  if (order.paymentStatus !== 'paid') {
    throw new InvoiceOrderError('NOT_PAID', 'La facture n’est disponible que pour les commandes payées.')
  }

  const site =
    typeof order.site === 'object' && order.site !== null
      ? order.site
      : await payload.findByID({
          collection: 'sites',
          id: siteId,
          depth: 0,
          overrideAccess: true,
        })

  return {
    order,
    site: {
      name: site.name,
      contact: site.contact,
      legal: site.legal,
    },
  }
}

export async function listPaidOrdersInPeriod(
  siteId: number,
  from: Date,
  to: Date,
): Promise<Order[]> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { site: { equals: siteId } },
        { paymentStatus: { equals: 'paid' } },
        { createdAt: { greater_than_equal: from.toISOString() } },
        { createdAt: { less_than_equal: to.toISOString() } },
      ],
    },
    sort: 'createdAt',
    limit: 500,
    depth: 1,
    overrideAccess: true,
  })

  return result.docs
}
