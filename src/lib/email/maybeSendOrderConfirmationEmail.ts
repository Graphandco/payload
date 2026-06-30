/**
 * Envoie la confirmation client une seule fois quand la commande est payée.
 *
 * Appelé après synchro Mollie (webhook, page suivi) : si l'envoi échoue,
 * le flag reste à false pour retenter au prochain passage.
 */
import configPromise from '@payload-config'
import type { Order, Site } from '@/payload-types'
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmationEmail'
import { getPayload } from 'payload'

export async function maybeSendOrderConfirmationEmail(
  order: Order,
  site: Pick<Site, 'name' | 'slug' | 'domain' | 'contact'>,
): Promise<Order> {
  if (order.paymentStatus !== 'paid') {
    return order
  }

  if (order.confirmationEmailSent) {
    return order
  }

  const recipient = order.customer?.email?.trim()
  if (!recipient) {
    console.warn(`[maybeSendOrderConfirmationEmail] Order ${order.id} : email client manquant.`)
    return order
  }

  try {
    await sendOrderConfirmationEmail(order, site)

    const payload = await getPayload({ config: configPromise })
    const updated = await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        confirmationEmailSent: true,
      },
      overrideAccess: true,
    })

    console.info(`[maybeSendOrderConfirmationEmail] Confirmation envoyée pour la commande ${order.id}.`)

    return updated as Order
  } catch (error) {
    console.error(`[maybeSendOrderConfirmationEmail] Order ${order.id}`, error)
    return order
  }
}
