/**
 * Génération PDF facture (pdf-lib) — design inspiré des factures Graph and Co.
 */
import type { Order, Site } from '@/payload-types'
import { formatInvoiceNumber } from '@/lib/invoices/formatInvoiceNumber'
import { formatOrderNumber } from '@/lib/formatOrderNumber'
import { formatPrice } from '@/lib/formatPrice'
import { formatPickupSlotLabel } from '@/lib/kitchen/formatPickupSlotLabel'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib'

type InvoiceSite = Pick<Site, 'name' | 'contact' | 'legal'>

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 48
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const COLORS = {
  primary: rgb(13 / 255, 122 / 255, 91 / 255),
  primaryDark: rgb(1 / 255, 42 / 255, 36 / 255),
  text: rgb(1 / 255, 42 / 255, 36 / 255),
  muted: rgb(0.42, 0.52, 0.5),
  border: rgb(0.77, 0.91, 0.87),
  surface: rgb(0.96, 0.99, 0.98),
  white: rgb(1, 1, 1),
}

function formatInvoiceDateShort(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  }).format(new Date(isoDate))
}

/** Ex. « ÉMETTEUR » → « É M E T T E U R » */
function spacedLabel(label: string): string {
  return label.toUpperCase().split('').join(' ')
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  options: { size?: number; font: PDFFont; color?: RGB; maxWidth?: number },
): number {
  const size = options.size ?? 10
  page.drawText(text, {
    x,
    y,
    size,
    font: options.font,
    color: options.color ?? COLORS.text,
    maxWidth: options.maxWidth,
  })
  return size
}

function drawRightText(
  page: PDFPage,
  text: string,
  rightX: number,
  y: number,
  options: { size?: number; font: PDFFont; color?: RGB },
): void {
  const size = options.size ?? 10
  const width = options.font.widthOfTextAtSize(text, size)
  page.drawText(text, {
    x: rightX - width,
    y,
    size,
    font: options.font,
    color: options.color ?? COLORS.text,
  })
}

function buildEmitterLines(site: InvoiceSite): string[] {
  const legal = site.legal
  const contact = site.contact
  const lines: string[] = []

  lines.push(legal?.companyName?.trim() || site.name)
  if (contact?.street?.trim()) {
    lines.push(contact.street.trim())
  }
  const cityLine = [contact?.postalCode?.trim(), contact?.city?.trim()].filter(Boolean).join(' ')
  if (cityLine) {
    lines.push(cityLine)
  }
  if (contact?.phone?.trim()) {
    lines.push(`Tél. ${contact.phone.trim()}`)
  }
  if (contact?.email?.trim()) {
    lines.push(contact.email.trim())
  }
  if (legal?.siret?.trim()) {
    lines.push(`N° SIRET ${legal.siret.trim()}`)
  }
  if (legal?.vatNumber?.trim()) {
    lines.push(`TVA ${legal.vatNumber.trim()}`)
  }
  if (legal?.rcs?.trim()) {
    lines.push(legal.rcs.trim())
  }

  return lines
}

function buildCustomerLines(order: Order): string[] {
  const lines = [order.customer.name]
  if (order.customer.email) {
    lines.push(order.customer.email)
  }
  if (order.customer.phone) {
    lines.push(order.customer.phone)
  }
  return lines
}

function drawAddressBlock(
  page: PDFPage,
  label: string,
  lines: string[],
  x: number,
  topY: number,
  regular: PDFFont,
  bold: PDFFont,
): number {
  let y = topY

  drawText(page, spacedLabel(label), x, y, { size: 8, font: bold, color: COLORS.primary })
  y -= 18

  for (let i = 0; i < lines.length; i++) {
    const isFirst = i === 0
    drawText(page, lines[i], x, y, {
      size: isFirst ? 11 : 9.5,
      font: isFirst ? bold : regular,
      color: isFirst ? COLORS.text : COLORS.muted,
      maxWidth: 230,
    })
    y -= isFirst ? 16 : 13
  }

  return y
}

export async function buildInvoicePdfBuffer(
  order: Order,
  site: InvoiceSite,
  invoiceNumber: number,
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

  const invoiceLabel = formatInvoiceNumber(invoiceNumber)
  const orderLabel = formatOrderNumber(order.orderNumber)
  const pickupDate =
    typeof order.pickupSlot.date === 'string'
      ? order.pickupSlot.date
      : new Date(order.pickupSlot.date).toISOString()
  const pickupLabel = formatPickupSlotLabel(pickupDate, order.pickupSlot.time)

  // Bandeau accent
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 10,
    width: PAGE_WIDTH,
    height: 10,
    color: COLORS.primary,
  })

  // En-tête
  let y = PAGE_HEIGHT - 48
  drawText(page, 'Facture', MARGIN, y, { size: 11, font: bold, color: COLORS.primary })
  drawText(page, `n° ${invoiceLabel}`, MARGIN, y - 22, { size: 22, font: bold, color: COLORS.text })
  drawRightText(page, formatInvoiceDateShort(order.createdAt), PAGE_WIDTH - MARGIN, y, {
    size: 11,
    font: regular,
    color: COLORS.muted,
  })
  drawRightText(page, `Commande ${orderLabel}`, PAGE_WIDTH - MARGIN, y - 16, {
    size: 9,
    font: regular,
    color: COLORS.muted,
  })

  y -= 58
  drawText(page, `Retrait prévu : ${pickupLabel}`, MARGIN, y, {
    size: 9.5,
    font: regular,
    color: COLORS.muted,
  })

  // Blocs émetteur / client
  y -= 28
  const blockBottom = Math.min(
    drawAddressBlock(page, 'Émetteur', buildEmitterLines(site), MARGIN, y, regular, bold),
    drawAddressBlock(page, 'Facturé à', buildCustomerLines(order), MARGIN + 278, y, regular, bold),
  )

  // Tableau
  y = blockBottom - 24
  const tableTop = y
  const rowHeight = 28
  const colQty = MARGIN + 300
  const colUnitPrice = MARGIN + 360
  const colTotal = PAGE_WIDTH - MARGIN

  page.drawRectangle({
    x: MARGIN,
    y: tableTop - rowHeight + 6,
    width: CONTENT_WIDTH,
    height: rowHeight,
    color: COLORS.primary,
  })

  const headerBaseline = tableTop - 16
  drawText(page, spacedLabel('Désignation'), MARGIN + 10, headerBaseline, {
    size: 7.5,
    font: bold,
    color: COLORS.white,
  })
  drawText(page, spacedLabel('Qté'), colQty, headerBaseline, {
    size: 7.5,
    font: bold,
    color: COLORS.white,
  })
  drawRightText(page, spacedLabel('Prix TTC'), colUnitPrice + 50, headerBaseline, {
    size: 7.5,
    font: bold,
    color: COLORS.white,
  })
  drawRightText(page, spacedLabel('Total TTC'), colTotal - 10, headerBaseline, {
    size: 7.5,
    font: bold,
    color: COLORS.white,
  })

  y = tableTop - rowHeight - 4

  const orderLines = order.lines ?? []
  for (let i = 0; i < orderLines.length; i++) {
    const line = orderLines[i]
    const unitPrice = Number(line.price)
    const lineTotal = unitPrice * line.quantity
    const baseline = y - 18

    if (i % 2 === 1) {
      page.drawRectangle({
        x: MARGIN,
        y: y - rowHeight + 8,
        width: CONTENT_WIDTH,
        height: rowHeight,
        color: COLORS.surface,
      })
    }

    drawText(page, line.name, MARGIN + 10, baseline, {
      size: 10,
      font: regular,
      maxWidth: 270,
    })
    drawText(page, String(line.quantity), colQty + 4, baseline, { size: 10, font: regular })
    drawRightText(page, formatPrice(unitPrice), colUnitPrice + 50, baseline, {
      size: 10,
      font: regular,
      color: COLORS.muted,
    })
    drawRightText(page, formatPrice(lineTotal), colTotal - 10, baseline, { size: 10, font: bold })

    page.drawLine({
      start: { x: MARGIN, y: y - rowHeight + 6 },
      end: { x: PAGE_WIDTH - MARGIN, y: y - rowHeight + 6 },
      thickness: 0.5,
      color: COLORS.border,
    })

    y -= rowHeight
  }

  // Total
  y -= 8
  page.drawRectangle({
    x: MARGIN,
    y: y - 30,
    width: CONTENT_WIDTH,
    height: 34,
    color: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 0.5,
  })

  drawRightText(page, 'Total TTC', colTotal - 130, y - 14, { size: 10, font: bold, color: COLORS.muted })
  drawRightText(page, formatPrice(Number(order.total)), colTotal - 10, y - 16, {
    size: 14,
    font: bold,
    color: COLORS.primaryDark,
  })

  // Remerciement
  y -= 58
  drawText(page, 'Merci de votre confiance', MARGIN, y, {
    size: 12,
    font: bold,
    color: COLORS.primary,
  })

  // Pied de page légal
  const legal = site.legal

  function legalFooterPart(s: InvoiceSite): string | null {
    const parts = [
      s.legal?.companyName?.trim() || s.name,
      s.contact?.street?.trim(),
      [s.contact?.postalCode?.trim(), s.contact?.city?.trim()].filter(Boolean).join(' '),
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(' - ') : null
  }

  const footerParts = [
    legal?.additionalMentions?.trim(),
    [legalFooterPart(site), legal?.siret?.trim() ? `N° SIRET ${legal.siret.trim()}` : null]
      .filter(Boolean)
      .join(' — '),
  ].filter(Boolean)

  const footerText = footerParts.join(' — ')
  if (footerText) {
    page.drawLine({
      start: { x: MARGIN, y: 62 },
      end: { x: PAGE_WIDTH - MARGIN, y: 62 },
      thickness: 0.5,
      color: COLORS.border,
    })
    drawText(page, footerText, MARGIN, 44, {
      size: 7.5,
      font: regular,
      color: COLORS.muted,
      maxWidth: CONTENT_WIDTH,
    })
  }

  return Buffer.from(await pdfDoc.save())
}

export function buildInvoicePdfFilename(invoiceNumber: number, orderNumber: number): string {
  return `facture-${formatInvoiceNumber(invoiceNumber)}-commande-${String(orderNumber).padStart(4, '0')}.pdf`
}
