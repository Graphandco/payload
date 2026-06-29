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
