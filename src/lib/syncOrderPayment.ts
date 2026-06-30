/**
 * Synchronise le statut de paiement d'une commande depuis l'API Mollie,
 * puis déclenche l'e-mail de confirmation si le paiement est validé.
 */
import configPromise from '@payload-config'
import type { Order, Site } from '@/payload-types'
import { maybeSendOrderConfirmationEmail } from '@/lib/email/maybeSendOrderConfirmationEmail'
import { createMollieClientForSite, getMollieApiKey } from '@/lib/mollie'
import { mapMolliePaymentStatusToOrderPaymentStatus } from '@/lib/molliePaymentStatus'
import { getPayload } from 'payload'

export async function syncOrderPaymentFromMollie(site: Site, order: Order): Promise<Order> {
  let currentOrder = order

  if (order.paymentStatus === 'pending' && order.molliePaymentId && getMollieApiKey(site)) {
    const client = createMollieClientForSite(site)
    const payment = await client.payments.get(order.molliePaymentId)
    const mappedStatus = mapMolliePaymentStatusToOrderPaymentStatus(payment.status)

    if (mappedStatus && mappedStatus !== order.paymentStatus) {
      const payload = await getPayload({ config: configPromise })
      currentOrder = (await payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          paymentStatus: mappedStatus,
        },
        overrideAccess: true,
      })) as Order
    }
  }

  return maybeSendOrderConfirmationEmail(currentOrder, site)
}
