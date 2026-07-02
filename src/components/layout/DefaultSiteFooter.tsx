/**
 * Pied de page du shell par défaut.
 */
import Link from 'next/link'
import type { Site } from '@/payload-types'
import {
  MENTIONS_LEGALES_SLUG,
  PRIVACY_POLICY_SLUG,
} from '@/components/legal/LegalPages'

type Props = {
  site: Site
}

function formatAddress(contact: NonNullable<Site['contact']>) {
  const cityLine = [contact.postalCode, contact.city].filter(Boolean).join(' ')
  return [contact.street, cityLine].filter(Boolean).join(', ')
}

export function DefaultSiteFooter({ site }: Props) {
  const contact = site.contact
  const address = contact ? formatAddress(contact) : ''
  const year = new Date().getFullYear()

  return (
    <footer className="default-footer mt-auto border-t border-white/10">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="font-serif text-xl font-semibold tracking-tight">{site.name}</p>
            {address ? (
              <p className="default-footer-accent max-w-sm text-sm leading-relaxed">{address}</p>
            ) : null}
            <div className="default-footer-accent flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {contact?.email ? (
                <a className="default-footer-link" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              ) : null}
              {contact?.phone ? (
                <a className="default-footer-link" href={`tel:${contact.phone}`}>
                  {contact.phone}
                </a>
              ) : null}
            </div>
          </div>

          <nav className="flex flex-col gap-2 sm:items-end sm:text-right">
            <Link className="default-footer-link text-sm" href={`/${MENTIONS_LEGALES_SLUG}`}>
              Mentions légales
            </Link>
            <Link className="default-footer-link text-sm" href={`/${PRIVACY_POLICY_SLUG}`}>
              Politique de confidentialité
            </Link>
          </nav>
        </div>

        <p className="default-footer-accent mt-8 border-t border-white/10 pt-6 text-xs">
          © {year} {site.name}
        </p>
      </div>
    </footer>
  )
}
