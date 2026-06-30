import { describe, expect, it } from 'vitest'
import type { Order, Site } from '@/payload-types'
import { buildOrderConfirmationContent } from '@/lib/email/buildOrderConfirmationContent'

const site: Pick<Site, 'name' | 'slug' | 'domain'> = {
  name: 'Mama Pizza',
  slug: 'mama-pizza',
  domain: 'mamapizza.fr',
}

const order = {
  id: 1,
  orderNumber: 42,
  trackingToken: 'abc-123-def',
  total: 24.5,
  customer: {
    name: 'Jean Dupont',
    email: 'jean@exemple.fr',
    phone: '0600000000',
  },
  pickupSlot: {
    value: '2026-06-29T12:30',
    date: '2026-06-29',
    time: '12:30',
  },
  lines: [
    {
      name: 'Margherita',
      price: 12,
      quantity: 2,
    },
  ],
} as Order

describe('buildOrderConfirmationContent', () => {
  it('builds subject, tracking link and line items', () => {
    const content = buildOrderConfirmationContent(order, site)

    expect(content.subject).toBe('Mama Pizza — commande #0042 confirmée')
    expect(content.params.displayNumber).toBe('#0042')
    expect(content.params.customerName).toBe('Jean Dupont')
    expect(content.params.total).toMatch(/24,50/)
    expect(content.params.trackingUrl).toBe('https://mamapizza.fr/commande/suivi/abc-123-def')
    expect(content.params.lines).toHaveLength(1)
    expect(content.html).toContain('Jean Dupont')
    expect(content.html).toContain('Margherita')
    expect(content.html).toContain('https://clickandcollect.graphandco.com/email/order-confirmation.jpg')
    expect(content.html).toContain('width="500"')
    expect(content.text).toContain('Suivi : https://mamapizza.fr/commande/suivi/abc-123-def')
  })

  it('exposes params for a future Brevo template migration', () => {
    const content = buildOrderConfirmationContent(order, site)

    expect(content.params).toEqual({
      siteName: 'Mama Pizza',
      displayNumber: '#0042',
      customerName: 'Jean Dupont',
      pickupSlotLabel: content.params.pickupSlotLabel,
      total: content.params.total,
      trackingUrl: 'https://mamapizza.fr/commande/suivi/abc-123-def',
      lines: [{ name: 'Margherita', quantity: 2, lineTotal: '24,00 €' }],
    })
  })
})
