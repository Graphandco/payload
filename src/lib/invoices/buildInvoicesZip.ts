/**
 * Export ZIP de factures PDF sur une période (commandes payées).
 */
import { ZipArchive } from 'archiver'
import { PassThrough } from 'node:stream'
import { buildInvoicePdfBuffer, buildInvoicePdfFilename } from '@/lib/invoices/buildInvoicePdf'
import { ensureInvoiceNumber } from '@/lib/invoices/ensureInvoiceNumber'
import { listPaidOrdersInPeriod } from '@/lib/invoices/loadInvoiceOrderContext'

export async function buildInvoicesZipBuffer(
  siteId: number,
  from: Date,
  to: Date,
): Promise<{ buffer: Buffer; count: number }> {
  const orders = await listPaidOrdersInPeriod(siteId, from, to)

  if (orders.length === 0) {
    return { buffer: Buffer.alloc(0), count: 0 }
  }

  const archive = new ZipArchive({ zlib: { level: 9 } })
  const stream = new PassThrough()
  const chunks: Buffer[] = []

  stream.on('data', (chunk: Buffer) => chunks.push(chunk))

  const archiveDone = new Promise<void>((resolve, reject) => {
    stream.on('end', () => resolve())
    stream.on('error', reject)
    archive.on('error', reject)
  })

  archive.pipe(stream)

  for (const order of orders) {
    const site =
      typeof order.site === 'object' && order.site !== null
        ? {
            name: order.site.name,
            contact: order.site.contact,
            legal: order.site.legal,
          }
        : { name: 'Restaurant', contact: undefined, legal: undefined }

    const invoiceNumber = await ensureInvoiceNumber(order)
    const pdfBuffer = await buildInvoicePdfBuffer(order, site, invoiceNumber)
    archive.append(pdfBuffer, { name: buildInvoicePdfFilename(invoiceNumber, order.orderNumber) })
  }

  await archive.finalize()
  await archiveDone

  return {
    buffer: Buffer.concat(chunks),
    count: orders.length,
  }
}
