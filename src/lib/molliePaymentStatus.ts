/**
 * Correspondance statut paiement Mollie → statut commande Payload.
 */
import type { Order } from '@/payload-types'

export type MolliePaymentStatus =
  | 'open'
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'canceled'
  | 'expired'

export function mapMolliePaymentStatusToOrderPaymentStatus(
  status: string,
): Order['paymentStatus'] | null {
  switch (status) {
    case 'open':
    case 'pending':
      return 'pending'
    case 'authorized':
    case 'paid':
      return 'paid'
    case 'failed':
    case 'canceled':
    case 'expired':
      return 'failed'
    default:
      return null
  }
}
