import { describe, expect, it } from 'vitest'
import type { Order, Site } from '@/payload-types'
import {
  formatCountdown,
  getMillisecondsUntilPickup,
  serializePublicOrderTracking,
} from '@/lib/orderTracking'
import {
  isOrderTrackingPath,
  parseOrderTrackingToken,
} from '@/components/order-tracking/OrderTrackingPage'

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 1,
    site: 1,
    orderNumber: 42,
    status: 'in_progress',
    paymentStatus: 'pending',
    customer: {
      name: 'Jean Dupont',
      email: 'jean@exemple.fr',
      phone: '0612345678',
    },
    pickupSlot: {
      value: '2026-06-01T12:00',
      date: '2026-06-01',
      time: '12:00',
    },
    lines: [
      {
        name: 'Pizza',
        price: 12,
        quantity: 2,
      },
    ],
    total: 24,
    trackingToken: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    updatedAt: '2026-06-01T10:00:00.000Z',
    createdAt: '2026-06-01T10:00:00.000Z',
    ...overrides,
  } as Order
}

function makeSite(overrides: Partial<Site> = {}): Site {
  return {
    id: 1,
    name: 'Test',
    slug: 'test',
    updatedAt: '',
    createdAt: '',
    clickAndCollect: {
      tracking: {
        showPickupSlot: true,
        showCountdown: true,
      },
    },
    ...overrides,
  } as Site
}

describe('order tracking routes', () => {
  it('matches commande/suivi/[token] paths', () => {
    expect(isOrderTrackingPath('commande/suivi/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')).toBe(true)
    expect(parseOrderTrackingToken('commande/suivi/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')).toBe(
      'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    )
    expect(isOrderTrackingPath('commande')).toBe(false)
    expect(isOrderTrackingPath('commande/suivi')).toBe(false)
  })
})

describe('serializePublicOrderTracking', () => {
  it('exposes public order fields with tracking options', () => {
    const order = makeOrder()
    const site = makeSite()

    const publicOrder = serializePublicOrderTracking(order, site)

    expect(publicOrder.displayNumber).toBe('#0042')
    expect(publicOrder.statusLabel).toBe('En préparation')
    expect(publicOrder.pickupSlotLabel).toContain('12:00')
    expect(publicOrder.showCountdown).toBe(true)
    expect(publicOrder.lines).toHaveLength(1)
    expect(publicOrder.total).toBe(24)
  })

  it('hides pickup slot when disabled in site settings', () => {
    const site = makeSite({
      clickAndCollect: {
        tracking: {
          showPickupSlot: false,
          showCountdown: true,
        },
      },
    })

    const publicOrder = serializePublicOrderTracking(makeOrder(), site)

    expect(publicOrder.pickupSlotLabel).toBeNull()
    expect(publicOrder.pickupAtMs).toBeNull()
  })
})

describe('formatCountdown', () => {
  it('formats remaining time until pickup', () => {
    expect(formatCountdown(90 * 60_000)).toBe('Retrait dans 1 h 30 min')
    expect(formatCountdown(20 * 60_000)).toBe('Retrait dans 20 min')
    expect(formatCountdown(-1)).toBe('Votre créneau de retrait est arrivé')
  })

  it('computes milliseconds until pickup in Paris timezone', () => {
    const now = new Date('2026-06-01T10:00:00+02:00')
    const ms = getMillisecondsUntilPickup('2026-06-01', '12:00', now)

    expect(ms).toBe(2 * 60 * 60 * 1000)
  })
})
