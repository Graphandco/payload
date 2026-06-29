/**
 * Synchronise le statut de paiement d'une commande depuis l'API Mollie.
 */
import configPromise from '@payload-config'
import type { Order, Site } from '@/payload-types'
import { createMollieClientForSite, getMollieApiKey } from '@/lib/mollie'
import { mapMolliePaymentStatusToOrderPaymentStatus } from '@/lib/molliePaymentStatus'
import { getPayload } from 'payload'

export async function syncOrderPaymentFromMollie(site: Site, order: Order): Promise<Order> {
  if (order.paymentStatus !== 'pending' || !order.molliePaymentId) {
    return order
  }

  if (!getMollieApiKey(site)) {
    return order
  }

  const client = createMollieClientForSite(site)
  const payment = await client.payments.get(order.molliePaymentId)
  const mappedStatus = mapMolliePaymentStatusToOrderPaymentStatus(payment.status)

  if (!mappedStatus || mappedStatus === order.paymentStatus) {
    return order
  }

  const payload = await getPayload({ config: configPromise })
  const updated = await payload.update({
    collection: 'orders',
    id: order.id,
    data: {
      paymentStatus: mappedStatus,
    },
    overrideAccess: true,
  })

  return updated as Order
}
