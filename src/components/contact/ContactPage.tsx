/**
 * Point d'entrée serveur de /contact : passe le site au composant client ContactView.
 */
import { ContactView } from '@/components/contact/ContactView'
import type { Site } from '@/payload-types'

export const CONTACT_PAGE_SLUG = 'contact'

type Props = {
  site: Site
}

export function ContactPage({ site }: Props) {
  return <ContactView site={site} />
}

export function isContactPath(path: string): boolean {
  return path === CONTACT_PAGE_SLUG
}
