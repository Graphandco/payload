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

/** Illustration fixe (fichier : public/email/order-confirmation.png). */
const ORDER_CONFIRMATION_HEADER_IMAGE_URL =
  'https://clickandcollect.graphandco.com/email/order-confirmation.png'

const EMAIL_FONT_FAMILY = "'Outfit', Arial, Helvetica, sans-serif"

export type OrderConfirmationEmailParams = {
  siteName: string
  displayNumber: string
  customerName: string
  pickupSlotLabel: string
  pickupDateLabel: string
  pickupTime: string
  pickupAddress: string | null
  pickupStreet: string | null
  pickupCityLine: string | null
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

/** Date de retrait en français (ex. « lundi 29 juin »). */
function formatPickupDateLabel(date: string): string {
  const normalizedDate = date.includes('T') ? date : `${date}T12:00:00.000Z`

  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  }).format(new Date(normalizedDate))
}

function parsePickupAddress(contact?: Site['contact'] | null): {
  street: string | null
  cityLine: string | null
  inline: string | null
} {
  if (!contact) {
    return { street: null, cityLine: null, inline: null }
  }

  const street = contact.street?.trim() || null
  const cityLine = [contact.postalCode?.trim(), contact.city?.trim()].filter(Boolean).join(' ') || null
  const parts = [street, cityLine].filter((part): part is string => Boolean(part))

  return {
    street,
    cityLine,
    inline: parts.length > 0 ? parts.join(', ') : null,
  }
}

function buildPickupText(
  pickupDateLabel: string,
  pickupTime: string,
  street: string | null,
  cityLine: string | null,
): string {
  const datePart = `le ${pickupDateLabel} à ${pickupTime}`

  if (street || cityLine) {
    const lines = [`Vous pouvez la retirer ${datePart} à:`]
    if (street) {
      lines.push(street)
    }
    if (cityLine) {
      lines.push(cityLine)
    }
    return lines.join('\n')
  }

  return `Vous pouvez la retirer ${datePart}.`
}

function buildPickupHtml(
  pickupDateLabel: string,
  pickupTime: string,
  street: string | null,
  cityLine: string | null,
): string {
  const datePart = `le ${pickupDateLabel} à ${pickupTime}`

  if (street || cityLine) {
    const lines = [`Vous pouvez la retirer ${escapeHtml(datePart)} à:`]
    if (street) {
      lines.push(escapeHtml(street))
    }
    if (cityLine) {
      lines.push(escapeHtml(cityLine))
    }
    return lines.join('<br />')
  }

  return escapeHtml(`Vous pouvez la retirer ${datePart}.`)
}

export function buildOrderConfirmationContent(
  order: Order,
  site: Pick<Site, 'name' | 'slug' | 'domain' | 'contact'>,
): OrderConfirmationEmailContent {
  const displayNumber = formatOrderNumber(order.orderNumber)
  const pickupSlotLabel = formatPickupSlotLabel(order.pickupSlot.date, order.pickupSlot.time)
  const pickupDateLabel = formatPickupDateLabel(order.pickupSlot.date)
  const pickupTime = order.pickupSlot.time.trim()
  const { street: pickupStreet, cityLine: pickupCityLine, inline: pickupAddress } =
    parsePickupAddress(site.contact)
  const pickupText = buildPickupText(pickupDateLabel, pickupTime, pickupStreet, pickupCityLine)
  const pickupHtml = buildPickupHtml(pickupDateLabel, pickupTime, pickupStreet, pickupCityLine)
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
    pickupDateLabel,
    pickupTime,
    pickupAddress,
    pickupStreet,
    pickupCityLine,
    total: formatPrice(order.total),
    trackingUrl,
    lines,
  }

  const linesHtml = lines
    .map(
      (line) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #ebebeb;font-family:${EMAIL_FONT_FAMILY};font-size:15px;color:#1a1a1a;">
            ${escapeHtml(line.name)}&nbsp;&times;&nbsp;${line.quantity}
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #ebebeb;font-family:${EMAIL_FONT_FAMILY};font-size:15px;font-weight:600;color:#1a1a1a;text-align:right;white-space:nowrap;">
            ${escapeHtml(line.lineTotal)}
          </td>
        </tr>`,
    )
    .join('')

  const linesText = lines
    .map((line) => `- ${line.name} × ${line.quantity} : ${line.lineTotal}`)
    .join('\n')

  const subject = `${site.name} — commande ${displayNumber} confirmée`

  const html = `
    <div style="font-family:${EMAIL_FONT_FAMILY}; margin-block:10px;line-height:1.5;color:#1a1a1a;max-width:560px;">
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&amp;display=swap" rel="stylesheet" />
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 28px;border-collapse:collapse;">
        <tr>
          <td style="width:150px;vertical-align:middle;padding-right:20px;">
            <img
              src="${ORDER_CONFIRMATION_HEADER_IMAGE_URL}"
              alt=""
              width="150"
              style="display:block;width:150px;max-width:150px;height:auto;border:0;"
            />
          </td>
          <td style="vertical-align:middle;">
            <h1 style="font-family:${EMAIL_FONT_FAMILY};font-size:28px;font-weight:700;line-height:1.2;margin:0;color:#1a1a1a;">
              Merci pour votre commande
            </h1>
          </td>
        </tr>
      </table>
      <p style="font-family:${EMAIL_FONT_FAMILY};font-size:16px;margin:0 0 12px;">
        Bonjour ${escapeHtml(customerName)},
      </p>
      <p style="font-family:${EMAIL_FONT_FAMILY};font-size:16px;margin:0 0 20px;">
        Votre commande <strong>${escapeHtml(displayNumber)}</strong> chez <strong>${escapeHtml(site.name)}</strong> est confirmée et payée.
      </p>
      <p style="font-family:${EMAIL_FONT_FAMILY};font-size:16px;margin:0 0 28px;color:#333;">
        ${pickupHtml}
      </p>
      <p style="font-family:${EMAIL_FONT_FAMILY};font-size:16px;margin:0 0 12px;color:#333;">
        Voici les articles de votre commande :
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 8px;">
        <tbody>
          ${linesHtml}
        </tbody>
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 28px;">
        <tr>
          <td style="padding:16px 0 0;font-family:${EMAIL_FONT_FAMILY};font-size:16px;font-weight:700;color:#1a1a1a;">
            Total
          </td>
          <td style="padding:16px 0 0;font-family:${EMAIL_FONT_FAMILY};font-size:18px;font-weight:700;color:#1a1a1a;text-align:right;">
            ${escapeHtml(params.total)}
          </td>
        </tr>
      </table>
      <p style="margin:0;">
        <a href="${escapeHtml(trackingUrl)}" style="display:inline-block;padding:14px 24px;background:#1a1a1a;color:#fff;font-family:${EMAIL_FONT_FAMILY};font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
          Suivre ma commande
        </a>
      </p>
    </div>
  `.trim()

  const text = [
    'Merci pour votre commande',
    '',
    `Bonjour ${customerName},`,
    '',
    `Votre commande ${displayNumber} chez ${site.name} est confirmée et payée.`,
    '',
    pickupText,
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
