/**
 * Pages légales template (données issues de sites.legal + sites.contact).
 */
import { MentionsLegalesView } from '@/components/legal/MentionsLegalesView'
import { PrivacyPolicyView } from '@/components/legal/PrivacyPolicyView'
import type { Site } from '@/payload-types'

export const MENTIONS_LEGALES_SLUG = 'mentions-legales'
export const PRIVACY_POLICY_SLUG = 'politique-de-confidentialite'

type Props = {
  site: Site
}

export function MentionsLegalesPage({ site }: Props) {
  return <MentionsLegalesView site={site} />
}

export function PrivacyPolicyPage({ site }: Props) {
  return <PrivacyPolicyView site={site} />
}

export function isMentionsLegalesPath(path: string): boolean {
  return path === MENTIONS_LEGALES_SLUG
}

export function isPrivacyPolicyPath(path: string): boolean {
  return path === PRIVACY_POLICY_SLUG
}
