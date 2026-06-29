/**
 * Client Mollie par site (clé API dans clickAndCollect.mollieApiKey).
 */
import createMollieClient from '@mollie/api-client'
import type { Order, Site } from '@/payload-types'
import { formatOrderNumber } from '@/lib/formatOrderNumber'

export function getMollieApiKey(site: Site): string | null {
  const key = site.clickAndCollect?.mollieApiKey?.trim()
  return key || null
}

export function isMollieConfigured(site: Site): boolean {
  return getMollieApiKey(site) !== null
}

export function createMollieClientForSite(site: Site) {
  const apiKey = getMollieApiKey(site)
  if (!apiKey) {
    throw new Error('Mollie API key not configured')
  }

  return createMollieClient({ apiKey })
}

export async function createMolliePaymentForOrder(params: {
  site: Site
  order: Order
  redirectUrl: string
}): Promise<{ paymentId: string; checkoutUrl: string }> {
  const client = createMollieClientForSite(params.site)

  const payment = await client.payments.create({
    amount: {
      currency: 'EUR',
      value: params.order.total.toFixed(2),
    },
    description: `Commande ${formatOrderNumber(params.order.orderNumber)}`,
    redirectUrl: params.redirectUrl,
    metadata: {
      orderId: String(params.order.id),
      siteId: String(params.site.id),
      trackingToken: params.order.trackingToken,
    },
  })

  const checkoutUrl = payment.getCheckoutUrl()
  if (!checkoutUrl) {
    throw new Error('Mollie checkout URL missing')
  }

  return {
    paymentId: payment.id,
    checkoutUrl,
  }
}
