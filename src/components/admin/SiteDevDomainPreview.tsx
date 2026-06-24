'use client'

import { useFormFields } from '@payloadcms/ui'
import { getDevDomainFromSlug } from '@/lib/siteDomain'

export function SiteDevDomainPreview() {
  const { domain, slug } = useFormFields(([fields]) => ({
    domain: fields.domain?.value,
    slug: fields.slug?.value,
  }))

  if (domain || typeof slug !== 'string' || slug.trim().length === 0) {
    return null
  }

  return (
    <p style={{ margin: 0, color: 'var(--theme-elevation-500)', fontSize: '0.875rem' }}>
      Domaine utilisé en dev : <strong>{getDevDomainFromSlug(slug)}</strong>
    </p>
  )
}
