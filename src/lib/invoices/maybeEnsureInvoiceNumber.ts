/**
 * Attribue un numéro de facture dès que la commande est payée (sans générer de PDF).
 */
import configPromise from '@payload-config'
import type { Order } from '@/payload-types'
import { ensureInvoiceNumber } from '@/lib/invoices/ensureInvoiceNumber'
import { formatInvoiceNumber } from '@/lib/invoices/formatInvoiceNumber'
import { getPayload } from 'payload'

export async function maybeEnsureInvoiceNumber(order: Order): Promise<Order> {
  if (order.paymentStatus !== 'paid') {
    return order
  }

  if (order.invoiceNumber && order.invoiceNumber > 0) {
    return order
  }

  try {
    const invoiceNumber = await ensureInvoiceNumber(order)
    const payload = await getPayload({ config: configPromise })
    const updated = await payload.findByID({
      collection: 'orders',
      id: order.id,
      depth: 0,
      overrideAccess: true,
    })

    console.info(
      `[maybeEnsureInvoiceNumber] ${formatInvoiceNumber(invoiceNumber)} attribué à la commande ${order.id}.`,
    )

    return updated as Order
  } catch (error) {
    console.error(`[maybeEnsureInvoiceNumber] Order ${order.id}`, error)
    return order
  }
}
