import { describe, expect, it } from 'vitest'
import { getHostnameFromHeaders, getSlugGuessFromHostname } from '@/lib/resolveTenantDomain'

describe('resolveTenantDomain', () => {
  it('prefers x-tenant-domain then forwarded host', () => {
    const headers = new Headers({
      'x-tenant-domain': 'graphandco.fr',
      'x-forwarded-host': 'other.fr',
      host: 'localhost:3000',
    })

    expect(getHostnameFromHeaders(headers)).toBe('graphandco.fr')
  })

  it('falls back to host header', () => {
    const headers = new Headers({
      host: 'lucelle-app.localhost:3000',
    })

    expect(getHostnameFromHeaders(headers)).toBe('lucelle-app.localhost')
  })

  it('derives slug guess from prod domain', () => {
    expect(getSlugGuessFromHostname('graphandco.fr')).toBe('graphandco')
    expect(getSlugGuessFromHostname('lucelle-app.localhost')).toBe('lucelle-app')
  })
})
