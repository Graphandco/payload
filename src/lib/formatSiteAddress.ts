import type { Site } from '@/payload-types'

type ContactAddress = NonNullable<Site['contact']>

export function formatSiteAddress(contact?: ContactAddress | null): string | null {
  if (!contact) {
    return null
  }

  const { street, postalCode, city } = contact
  const cityLine = [postalCode, city].filter(Boolean).join(' ').trim()
  const lines = [street?.trim(), cityLine].filter((line) => line && line.length > 0)

  if (lines.length === 0) {
    return null
  }

  return lines.join('\n')
}

export function hasSiteContactDetails(contact?: ContactAddress | null): boolean {
  if (!contact) {
    return false
  }

  return Boolean(
    contact.email ||
      contact.phone ||
      contact.street ||
      contact.postalCode ||
      contact.city,
  )
}
