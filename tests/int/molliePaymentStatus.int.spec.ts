import { describe, expect, it } from 'vitest'
import { mapMolliePaymentStatusToOrderPaymentStatus } from '@/lib/molliePaymentStatus'

describe('mapMolliePaymentStatusToOrderPaymentStatus', () => {
  it('maps open and pending to pending', () => {
    expect(mapMolliePaymentStatusToOrderPaymentStatus('open')).toBe('pending')
    expect(mapMolliePaymentStatusToOrderPaymentStatus('pending')).toBe('pending')
  })

  it('maps authorized and paid to paid', () => {
    expect(mapMolliePaymentStatusToOrderPaymentStatus('authorized')).toBe('paid')
    expect(mapMolliePaymentStatusToOrderPaymentStatus('paid')).toBe('paid')
  })

  it('maps failed terminal states to failed', () => {
    expect(mapMolliePaymentStatusToOrderPaymentStatus('failed')).toBe('failed')
    expect(mapMolliePaymentStatusToOrderPaymentStatus('canceled')).toBe('failed')
    expect(mapMolliePaymentStatusToOrderPaymentStatus('expired')).toBe('failed')
  })

  it('returns null for unknown statuses', () => {
    expect(mapMolliePaymentStatusToOrderPaymentStatus('refunded')).toBeNull()
    expect(mapMolliePaymentStatusToOrderPaymentStatus('unknown')).toBeNull()
  })
})

describe('getSitePublicUrl', () => {
  it('builds tracking URL from request origin', async () => {
    const { getOrderTrackingUrl } = await import('@/lib/getSitePublicUrl')

    const url = getOrderTrackingUrl(
      { slug: 'graphandco', domain: null },
      'abc-123',
      { origin: 'http://graphandco.localhost:3000' },
    )

    expect(url).toBe('http://graphandco.localhost:3000/commande/suivi/abc-123')
  })

  it('falls back to dev localhost domain', async () => {
    const { getOrderTrackingUrl } = await import('@/lib/getSitePublicUrl')

    const url = getOrderTrackingUrl({ slug: 'graphandco', domain: null }, 'abc-123')

    expect(url).toBe('http://graphandco.localhost:3000/commande/suivi/abc-123')
  })
})

describe('getMollieWebhookUrl', () => {
  it('uses MOLLIE_WEBHOOK_URL when set', async () => {
    const previous = process.env.MOLLIE_WEBHOOK_URL
    process.env.MOLLIE_WEBHOOK_URL = 'https://youclickyoucollect.fr/api/mollie/webhook'

    const { getMollieWebhookUrl } = await import('@/lib/mollie')
    expect(getMollieWebhookUrl()).toBe('https://youclickyoucollect.fr/api/mollie/webhook')

    if (previous === undefined) {
      delete process.env.MOLLIE_WEBHOOK_URL
    } else {
      process.env.MOLLIE_WEBHOOK_URL = previous
    }
  })

  it('builds URL from NEXT_PUBLIC_SERVER_URL', async () => {
    const previousWebhook = process.env.MOLLIE_WEBHOOK_URL
    const previousServer = process.env.NEXT_PUBLIC_SERVER_URL
    delete process.env.MOLLIE_WEBHOOK_URL
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://youclickyoucollect.fr'

    const { getMollieWebhookUrl } = await import('@/lib/mollie')
    expect(getMollieWebhookUrl()).toBe('https://youclickyoucollect.fr/api/mollie/webhook')

    if (previousWebhook === undefined) {
      delete process.env.MOLLIE_WEBHOOK_URL
    } else {
      process.env.MOLLIE_WEBHOOK_URL = previousWebhook
    }

    if (previousServer === undefined) {
      delete process.env.NEXT_PUBLIC_SERVER_URL
    } else {
      process.env.NEXT_PUBLIC_SERVER_URL = previousServer
    }
  })
})

describe('parseMollieWebhookPaymentId', () => {
  it('parses form-urlencoded body', async () => {
    const { parseMollieWebhookPaymentId } = await import('@/lib/mollieWebhook')
    const request = new Request('https://example.com/api/mollie/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'id=tr_abc123',
    })

    await expect(parseMollieWebhookPaymentId(request)).resolves.toBe('tr_abc123')
  })

  it('parses json body', async () => {
    const { parseMollieWebhookPaymentId } = await import('@/lib/mollieWebhook')
    const request = new Request('https://example.com/api/mollie/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'tr_json456' }),
    })

    await expect(parseMollieWebhookPaymentId(request)).resolves.toBe('tr_json456')
  })
})
