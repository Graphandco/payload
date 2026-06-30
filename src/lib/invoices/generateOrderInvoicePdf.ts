/**
 * Génère le buffer PDF d'une facture (le n° est déjà attribué au paiement, sinon ici).
 */
import { buildInvoicePdfBuffer, buildInvoicePdfFilename } from '@/lib/invoices/buildInvoicePdf'
import { ensureInvoiceNumber } from '@/lib/invoices/ensureInvoiceNumber'
import {
  InvoiceOrderError,
  loadInvoiceOrderContext,
} from '@/lib/invoices/loadInvoiceOrderContext'

export type InvoicePdfResult = {
  buffer: Buffer
  filename: string
}

export async function generateOrderInvoicePdf(
  siteId: number,
  orderId: number,
): Promise<InvoicePdfResult> {
  const { order, site } = await loadInvoiceOrderContext(siteId, orderId)
  const invoiceNumber = await ensureInvoiceNumber(order)

  const buffer = await buildInvoicePdfBuffer(order, site, invoiceNumber)

  return {
    buffer,
    filename: buildInvoicePdfFilename(invoiceNumber, order.orderNumber),
  }
}

export { InvoiceOrderError }
