/**
 * Envoi du mail de confirmation client après paiement validé.
 */
import type { Order, Site } from '@/payload-types'
import { buildOrderConfirmationContent } from '@/lib/email/buildOrderConfirmationContent'
import { SendEmailError, sendEmailViaBrevo } from '@/lib/email/sendEmailViaBrevo'

export async function sendOrderConfirmationEmail(
  order: Order,
  site: Pick<Site, 'name' | 'slug' | 'domain' | 'contact'>,
): Promise<{ messageId?: string }> {
  const recipient = order.customer.email.trim()
  if (!recipient) {
    throw new SendEmailError('Adresse e-mail client manquante.')
  }

  const { subject, html, text } = buildOrderConfirmationContent(order, site)

  return sendEmailViaBrevo({
    to: recipient,
    subject,
    html,
    text,
    site,
    includeReplyTo: false,
  })
}
