/**
 * Webhook Mollie : parsing de la requête et synchro commande par ID paiement.
 */
import configPromise from '@payload-config'
import type { Order, Site } from '@/payload-types'
import { syncOrderPaymentFromMollie } from '@/lib/syncOrderPayment'
import { getPayload } from 'payload'

export type MollieWebhookResult =
  | { status: 'synced'; orderId: number; paymentStatus: Order['paymentStatus'] }
  | { status: 'unchanged'; orderId: number; paymentStatus: Order['paymentStatus'] }
  | { status: 'not_found' }
  | { status: 'invalid_body' }
  | { status: 'error' }

export async function parseMollieWebhookPaymentId(request: Request): Promise<string | null> {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    try {
      const body = (await request.json()) as { id?: unknown }
      return typeof body.id === 'string' && body.id.trim() ? body.id.trim() : null
    } catch {
      return null
    }
  }

  const text = (await request.text()).trim()
  if (!text) {
    return null
  }

  const params = new URLSearchParams(text)
  const formId = params.get('id')?.trim()
  if (formId) {
    return formId
  }

  try {
    const body = JSON.parse(text) as { id?: unknown }
    return typeof body.id === 'string' && body.id.trim() ? body.id.trim() : null
  } catch {
    return null
  }
}

async function findOrderWithSiteByMolliePaymentId(
  paymentId: string,
): Promise<{ order: Order; site: Site } | null> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'orders',
    where: {
      molliePaymentId: { equals: paymentId },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const order = result.docs[0] as Order | undefined
  if (!order) {
    return null
  }

  const siteId = typeof order.site === 'number' ? order.site : order.site?.id
  if (!siteId) {
    return null
  }

  const site = await payload.findByID({
    collection: 'sites',
    id: siteId,
    depth: 0,
    overrideAccess: true,
  })

  return { order, site: site as Site }
}

export async function processMollieWebhook(paymentId: string): Promise<MollieWebhookResult> {
  try {
    const match = await findOrderWithSiteByMolliePaymentId(paymentId)
    if (!match) {
      return { status: 'not_found' }
    }

    const previousStatus = match.order.paymentStatus
    const updatedOrder = await syncOrderPaymentFromMollie(match.site, match.order)

    if (updatedOrder.paymentStatus === previousStatus) {
      return {
        status: 'unchanged',
        orderId: updatedOrder.id,
        paymentStatus: updatedOrder.paymentStatus,
      }
    }

    return {
      status: 'synced',
      orderId: updatedOrder.id,
      paymentStatus: updatedOrder.paymentStatus,
    }
  } catch (error) {
    console.error('[processMollieWebhook]', paymentId, error)
    return { status: 'error' }
  }
}
