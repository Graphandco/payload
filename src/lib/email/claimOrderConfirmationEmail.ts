/**
 * Réserve atomiquement l'envoi du mail de confirmation (anti-doublon webhook / page suivi).
 */
import { sql } from '@payloadcms/db-postgres'
import type { BasePayload } from 'payload'

function getClaimedRows(result: unknown): unknown[] {
  if (Array.isArray(result)) {
    return result
  }

  if (result && typeof result === 'object' && 'rows' in result) {
    const rows = (result as { rows?: unknown }).rows
    return Array.isArray(rows) ? rows : []
  }

  return []
}

export async function claimOrderConfirmationEmail(
  payload: BasePayload,
  orderId: number,
): Promise<boolean> {
  const result = await payload.db.drizzle.execute(sql`
    UPDATE "orders"
    SET
      "confirmation_email_sent" = true,
      "updated_at" = now()
    WHERE
      "id" = ${orderId}
      AND "payment_status" = 'paid'
      AND COALESCE("confirmation_email_sent", false) = false
    RETURNING "id"
  `)

  return getClaimedRows(result).length > 0
}

export async function releaseOrderConfirmationEmailClaim(
  payload: BasePayload,
  orderId: number,
): Promise<void> {
  await payload.update({
    collection: 'orders',
    id: orderId,
    data: {
      confirmationEmailSent: false,
    },
    overrideAccess: true,
  })
}
