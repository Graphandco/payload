/**
 * Envoie la confirmation client une seule fois quand la commande est payée.
 *
 * Appelé après synchro Mollie (webhook, page suivi) : la réservation en base
 * évite les doublons si plusieurs flux passent en parallèle.
 */
import configPromise from '@payload-config'
import type { Order, Site } from '@/payload-types'
import {
  claimOrderConfirmationEmail,
  releaseOrderConfirmationEmailClaim,
} from '@/lib/email/claimOrderConfirmationEmail'
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmationEmail'
import { getPayload } from 'payload'

async function reloadOrder(payload: Awaited<ReturnType<typeof getPayload>>, orderId: number): Promise<Order> {
  return (await payload.findByID({
    collection: 'orders',
    id: orderId,
    depth: 0,
    overrideAccess: true,
  })) as Order
}

export async function maybeSendOrderConfirmationEmail(
  order: Order,
  site: Pick<Site, 'name' | 'slug' | 'domain' | 'contact'>,
): Promise<Order> {
  if (order.paymentStatus !== 'paid') {
    return order
  }

  const recipient = order.customer?.email?.trim()
  if (!recipient) {
    console.warn(`[maybeSendOrderConfirmationEmail] Order ${order.id} : email client manquant.`)
    return order
  }

  const payload = await getPayload({ config: configPromise })

  const claimed = await claimOrderConfirmationEmail(payload, order.id)
  if (!claimed) {
    return reloadOrder(payload, order.id)
  }

  try {
    await sendOrderConfirmationEmail(order, site)

    console.info(`[maybeSendOrderConfirmationEmail] Confirmation envoyée pour la commande ${order.id}.`)

    return reloadOrder(payload, order.id)
  } catch (error) {
    await releaseOrderConfirmationEmailClaim(payload, order.id)
    console.error(`[maybeSendOrderConfirmationEmail] Order ${order.id}`, error)
    return order
  }
}
