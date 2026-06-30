/**
 * GET /api/orders/staff/invoices/export — export ZIP des factures sur une période.
 */
import { buildInvoicesZipBuffer } from '@/lib/invoices/buildInvoicesZip'
import { requireSiteStaffAccess } from '@/lib/requireSiteStaffAccess'
import { endOfDay, parseISO, startOfDay } from 'date-fns'
import { z } from 'zod'

const querySchema = z.object({
  siteId: z.coerce.number().int().positive(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function GET(request: Request) {
  const url = new URL(request.url)
  const parsed = querySchema.safeParse({
    siteId: url.searchParams.get('siteId'),
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
  })

  if (!parsed.success) {
    return Response.json(
      { error: 'INVALID_QUERY', message: 'Paramètres siteId, from et to requis (YYYY-MM-DD).' },
      { status: 400 },
    )
  }

  const { siteId, from, to } = parsed.data
  const access = await requireSiteStaffAccess(request, siteId)

  if (!access.ok) {
    return Response.json({ error: 'FORBIDDEN', message: access.message }, { status: access.status })
  }

  const fromDate = startOfDay(parseISO(from))
  const toDate = endOfDay(parseISO(to))

  if (fromDate > toDate) {
    return Response.json(
      { error: 'INVALID_RANGE', message: 'La date de début doit précéder la date de fin.' },
      { status: 400 },
    )
  }

  try {
    const { buffer, count } = await buildInvoicesZipBuffer(siteId, fromDate, toDate)

    if (count === 0) {
      return Response.json(
        { error: 'EMPTY', message: 'Aucune commande payée sur cette période.' },
        { status: 404 },
      )
    }

    const filename = `factures-${from}_${to}.zip`

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[GET /api/orders/staff/invoices/export]', error)
    return Response.json({ error: 'INTERNAL_ERROR', message: 'Une erreur est survenue.' }, { status: 500 })
  }
}
