import type { Site } from '@/payload-types'
import { notFound } from 'next/navigation'

export function requireSite(site: Site | null): Site {
  if (!site) {
    notFound()
  }

  return site
}

export function requireDefined<T>(value: T | null | undefined): T {
  if (value == null) {
    notFound()
  }

  return value
}
