/**
 * POST /api/mollie/webhook — notification Mollie (statut paiement).
 * Mollie envoie l'ID du paiement ; on interroge l'API Mollie pour mettre à jour la commande.
 */
import { parseMollieWebhookPaymentId, processMollieWebhook } from '@/lib/mollieWebhook'

export async function POST(request: Request) {
  const paymentId = await parseMollieWebhookPaymentId(request)

  if (!paymentId) {
    console.warn('[POST /api/mollie/webhook] Missing payment id')
    return new Response(null, { status: 400 })
  }

  const result = await processMollieWebhook(paymentId)

  if (result.status === 'error') {
    return new Response(null, { status: 500 })
  }

  if (result.status === 'synced') {
    console.info(
      `[POST /api/mollie/webhook] Order ${result.orderId} payment → ${result.paymentStatus}`,
    )
  }

  // Toujours 200 pour not_found / unchanged : évite les retries infinies Mollie.
  return new Response(null, { status: 200 })
}
