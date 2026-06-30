/**
 * GET /api/orders/staff/[id]/invoice — facture PDF d'une commande payée.
 */
import { generateOrderInvoicePdf, InvoiceOrderError } from '@/lib/invoices/generateOrderInvoicePdf'
import { requireSiteStaffAccess } from '@/lib/requireSiteStaffAccess'
import { z } from 'zod'

const querySchema = z.object({
  siteId: z.coerce.number().int().positive(),
})

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params
  const orderId = Number(id)

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return Response.json({ error: 'INVALID_ID', message: 'Identifiant invalide.' }, { status: 400 })
  }

  const url = new URL(request.url)
  const parsed = querySchema.safeParse({ siteId: url.searchParams.get('siteId') })

  if (!parsed.success) {
    return Response.json({ error: 'INVALID_QUERY', message: 'Paramètre siteId invalide.' }, { status: 400 })
  }

  const { siteId } = parsed.data
  const access = await requireSiteStaffAccess(request, siteId)

  if (!access.ok) {
    return Response.json({ error: 'FORBIDDEN', message: access.message }, { status: access.status })
  }

  try {
    const { buffer, filename } = await generateOrderInvoicePdf(siteId, orderId)

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    if (error instanceof InvoiceOrderError) {
      const status = error.code === 'NOT_FOUND' ? 404 : 409
      return Response.json({ error: error.code, message: error.message }, { status })
    }

    console.error('[GET /api/orders/staff/[id]/invoice]', error)
    return Response.json({ error: 'INTERNAL_ERROR', message: 'Une erreur est survenue.' }, { status: 500 })
  }
}
