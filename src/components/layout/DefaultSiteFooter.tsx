/**
 * Pied de page du shell par défaut.
 */
import Link from 'next/link'
import { SiteContactDetails } from '@/components/contact/SiteContactDetails'
import { MENTIONS_LEGALES_SLUG, PRIVACY_POLICY_SLUG } from '@/components/legal/LegalPages'
import type { Site } from '@/payload-types'

type Props = {
  site: Site
}

export function DefaultSiteFooter({ site }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer className="default-footer mt-auto border-t border-white/10">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xl tracking-tight mb-2">{site.name}</p>
            <SiteContactDetails
              site={site}
              showEmptyMessage={false}
              listClassName="default-footer-accent"
              linkClassName="default-footer-link"
              iconClassName="default-footer-accent mt-0.5 size-4 shrink-0"
            />
          </div>

          <div className="flex flex-col gap-2 sm:items-end sm:text-right">
            <nav className="flex flex-col gap-2">
              <Link className="default-footer-link text-sm" href={`/${MENTIONS_LEGALES_SLUG}`}>
                Mentions légales
              </Link>
              <Link className="default-footer-link text-sm" href={`/${PRIVACY_POLICY_SLUG}`}>
                Politique de confidentialité
              </Link>
            </nav>
            <a
              href="https://graphandco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="default-footer-link default-footer-accent mt-2 inline-flex items-center gap-2 text-sm"
            >
              <img src="/logo.svg" alt="Graph and Co" className="h-5 w-auto shrink-0" />
              <span>
                {year} ©{site.name}
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
