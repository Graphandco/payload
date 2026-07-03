import { describe, expect, it } from 'vitest'
import {
  buildTenantPageMetadata,
  resolveIndexablePageKey,
} from '@/lib/seo/tenantPageSeo'
import type { Site } from '@/payload-types'

const site = {
  id: 1,
  name: 'Graph and Co',
  slug: 'graphandco',
  domain: 'youclickyoucollect.fr',
} as Site

describe('tenantPageSeo', () => {
  it('marks indexable routes', () => {
    expect(resolveIndexablePageKey('')).toBe('home')
    expect(resolveIndexablePageKey('carte')).toBe('carte')
    expect(resolveIndexablePageKey('contact')).toBe('contact')
    expect(resolveIndexablePageKey('panier')).toBeNull()
  })

  it('indexes home, carte and contact', () => {
    expect(buildTenantPageMetadata(site, '').robots).toEqual({ index: true, follow: true })
    expect(buildTenantPageMetadata(site, 'carte').robots).toEqual({ index: true, follow: true })
    expect(buildTenantPageMetadata(site, 'contact').robots).toEqual({ index: true, follow: true })
  })

  it('noindexes private routes', () => {
    expect(buildTenantPageMetadata(site, 'panier').robots).toEqual({
      index: false,
      follow: false,
    })
    expect(buildTenantPageMetadata(site, 'commande/checkout').robots).toEqual({
      index: false,
      follow: false,
    })
    expect(buildTenantPageMetadata(site, 'mentions-legales').robots).toEqual({
      index: false,
      follow: false,
    })
  })
})
