import { describe, expect, it } from 'vitest'
import type { Order, Site } from '@/payload-types'
import { buildOrderConfirmationContent } from '@/lib/email/buildOrderConfirmationContent'

const site: Pick<Site, 'name' | 'slug' | 'domain' | 'contact'> = {
  name: 'Graph and Co',
  slug: 'graphandco',
  domain: 'youclickyoucollect.fr',
  contact: {
    street: '12 rue de la Pizza',
    postalCode: '67000',
    city: 'Strasbourg',
  },
}

const order = {
  id: 1,
  orderNumber: 11,
  trackingToken: 'abc-123-def',
  total: 24.5,
  customer: {
    name: 'Régis',
    email: 'regis@exemple.fr',
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
  it('builds header, pickup address and line items', () => {
    const content = buildOrderConfirmationContent(order, site)

    expect(content.subject).toBe('Graph and Co — commande #0011 confirmée')
    expect(content.params.displayNumber).toBe('#0011')
    expect(content.params.customerName).toBe('Régis')
    expect(content.params.pickupAddress).toBe('12 rue de la Pizza, 67000 Strasbourg')
    expect(content.params.pickupStreet).toBe('12 rue de la Pizza')
    expect(content.params.pickupCityLine).toBe('67000 Strasbourg')
    expect(content.params.trackingUrl).toBe(
      'https://youclickyoucollect.fr/commande/suivi/abc-123-def',
    )
    expect(content.html).toContain('Merci pour votre commande')
    expect(content.html).toContain('Outfit')
    expect(content.html).toContain('order-confirmation.png')
    expect(content.html).toContain('width="150"')
    expect(content.html).toContain('Bonjour Régis')
    expect(content.html).toContain('#0011')
    expect(content.html).toContain('Vous pouvez la retirer le')
    expect(content.html).toContain('à:<br />12 rue de la Pizza<br />67000 Strasbourg')
    expect(content.html).toContain('Margherita')
    expect(content.html).not.toContain('Présentez-vous au restaurant')
    expect(content.text).toContain('Vous pouvez la retirer le')
    expect(content.text).toContain('Vous pouvez la retirer le lundi 29 juin à 12:30 à:')
    expect(content.text).toContain('12 rue de la Pizza')
    expect(content.text).toContain('67000 Strasbourg')
  })

  it('exposes params for a future Brevo template migration', () => {
    const content = buildOrderConfirmationContent(order, site)

    expect(content.params.siteName).toBe('Graph and Co')
    expect(content.params.pickupTime).toBe('12:30')
    expect(content.params.lines).toEqual([
      { name: 'Margherita', quantity: 2, lineTotal: '24,00 €' },
    ])
  })
})
