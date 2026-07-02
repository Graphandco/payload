import type { Site } from '@/payload-types'

export type SiteLegalContext = {
  siteName: string
  companyName: string
  legalRepresentative: string | null
  publicationDirector: string | null
  addressLine: string | null
  email: string | null
  phone: string | null
  siret: string | null
  privacyContactEmail: string | null
}

function formatAddress(street?: string | null, postalCode?: string | null, city?: string | null) {
  const cityLine = [postalCode?.trim(), city?.trim()].filter(Boolean).join(' ')
  const parts = [street?.trim(), cityLine].filter(Boolean)

  if (parts.length === 0) {
    return null
  }

  return parts.join(', ').toUpperCase()
}

export function getSiteLegalContext(site: Site): SiteLegalContext {
  const legal = site.legal
  const contact = site.contact
  const legalRepresentative = legal?.legalRepresentative?.trim() || null

  return {
    siteName: site.name,
    companyName: legal?.companyName?.trim() || site.name,
    legalRepresentative,
    publicationDirector: legalRepresentative,
    addressLine: formatAddress(contact?.street, contact?.postalCode, contact?.city),
    email: contact?.email?.trim() || null,
    phone: contact?.phone?.trim() || null,
    siret: legal?.siret?.trim() || null,
    privacyContactEmail: contact?.email?.trim() || null,
  }
}

export function formatLegalLastUpdated(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  }).format(new Date())
}
