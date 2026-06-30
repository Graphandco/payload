/**
 * Attribue un numéro de facture séquentiel par site (paiement validé ou première génération PDF).
 */
import configPromise from '@payload-config'
import type { Order } from '@/payload-types'
import { getPayload } from 'payload'

async function getNextInvoiceNumber(
  payload: Awaited<ReturnType<typeof getPayload>>,
  siteId: number,
): Promise<number> {
  const existing = await payload.find({
    collection: 'invoice-sequences',
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
      collection: 'invoice-sequences',
      id: sequence.id,
      data: { nextNumber },
      overrideAccess: true,
    })
    return nextNumber
  }

  await payload.create({
    collection: 'invoice-sequences',
    data: {
      site: siteId,
      nextNumber: 1,
    },
    overrideAccess: true,
  })

  return 1
}

function getSiteIdFromOrder(order: Order): number {
  return typeof order.site === 'object' && order.site !== null ? order.site.id : order.site
}

export async function ensureInvoiceNumber(order: Order): Promise<number> {
  if (order.invoiceNumber && order.invoiceNumber > 0) {
    return order.invoiceNumber
  }

  const payload = await getPayload({ config: configPromise })
  const siteId = getSiteIdFromOrder(order)
  const invoiceNumber = await getNextInvoiceNumber(payload, siteId)

  await payload.update({
    collection: 'orders',
    id: order.id,
    data: { invoiceNumber },
    depth: 0,
    overrideAccess: true,
  })

  return invoiceNumber
}
