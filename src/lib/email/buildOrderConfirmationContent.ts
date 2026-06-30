/**
 * Contenu du mail de confirmation commande (HTML généré côté app).
 *
 * Les `params` sont exposés pour une future migration vers un template Brevo
 * (`templateId` + variables) sans changer le déclencheur d'envoi.
 */
import type { Order, Site } from '@/payload-types'
import { formatOrderNumber } from '@/lib/formatOrderNumber'
import { formatPrice } from '@/lib/formatPrice'
import { getOrderTrackingUrl } from '@/lib/getSitePublicUrl'
import { formatPickupSlotLabel } from '@/lib/kitchen/formatPickupSlotLabel'

/** Bannière fixe (fichier : public/email/order-confirmation.jpg). */
const ORDER_CONFIRMATION_HEADER_IMAGE_URL =
  'https://clickandcollect.graphandco.com/email/order-confirmation.jpg'

export type OrderConfirmationEmailParams = {
  siteName: string
  displayNumber: string
  customerName: string
  pickupSlotLabel: string
  total: string
  trackingUrl: string
  lines: {
    name: string
    quantity: number
    lineTotal: string
  }[]
}

export type OrderConfirmationEmailContent = {
  subject: string
  html: string
  text: string
  params: OrderConfirmationEmailParams
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function buildOrderConfirmationContent(
  order: Order,
  site: Pick<Site, 'name' | 'slug' | 'domain'>,
): OrderConfirmationEmailContent {
  const displayNumber = formatOrderNumber(order.orderNumber)
  const pickupSlotLabel = formatPickupSlotLabel(order.pickupSlot.date, order.pickupSlot.time)
  const trackingUrl = getOrderTrackingUrl(site, order.trackingToken)
  const customerName = order.customer.name.trim()

  const lines = (order.lines ?? []).map((line) => ({
    name: line.name,
    quantity: line.quantity,
    lineTotal: formatPrice(line.price * line.quantity),
  }))

  const params: OrderConfirmationEmailParams = {
    siteName: site.name,
    displayNumber,
    customerName,
    pickupSlotLabel,
    total: formatPrice(order.total),
    trackingUrl,
    lines,
  }

  const linesHtml = lines
    .map(
      (line) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(line.name)} × ${line.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(line.lineTotal)}</td>
        </tr>`,
    )
    .join('')

  const linesText = lines.map((line) => `- ${line.name} × ${line.quantity} : ${line.lineTotal}`).join('\n')

  const subject = `${site.name} — commande ${displayNumber} confirmée`

  const html = `
    <div style="font-family:sans-serif;line-height:1.5;color:#111;max-width:560px;">
      <img
        src="${ORDER_CONFIRMATION_HEADER_IMAGE_URL}"
        alt="${escapeHtml(site.name)}"
        width="500"
        style="display:block;width:500px;max-width:100%;height:auto;margin:0 0 20px;border:0;"
      />
      <p>Bonjour ${escapeHtml(customerName)},</p>
      <p>Votre commande <strong>${escapeHtml(displayNumber)}</strong> chez <strong>${escapeHtml(site.name)}</strong> est confirmée et payée.</p>
      <p><strong>Créneau de retrait :</strong> ${escapeHtml(pickupSlotLabel)}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tbody>
          ${linesHtml}
        </tbody>
      </table>
      <p style="text-align:right;font-weight:bold;">Total : ${escapeHtml(params.total)}</p>
      <p>
        <a href="${escapeHtml(trackingUrl)}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">
          Suivre ma commande
        </a>
      </p>
      <p style="font-size:13px;color:#666;">Présentez-vous au restaurant au créneau choisi.</p>
    </div>
  `.trim()

  const text = [
    `Bonjour ${customerName},`,
    '',
    `Votre commande ${displayNumber} chez ${site.name} est confirmée et payée.`,
    `Créneau de retrait : ${pickupSlotLabel}`,
    '',
    'Articles :',
    linesText,
    '',
    `Total : ${params.total}`,
    '',
    `Suivi : ${trackingUrl}`,
  ].join('\n')

  return { subject, html, text, params }
}
