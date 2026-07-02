/**
 * Coordonnées du site (adresse, téléphone, e-mail) avec icônes.
 */
import { formatSiteAddress, hasSiteContactDetails } from '@/lib/formatSiteAddress'
import type { Site } from '@/payload-types'
import { Mail, MapPin, Phone } from 'lucide-react'

type Props = {
  site: Site
  linkClassName?: string
  iconClassName?: string
  listClassName?: string
  emptyClassName?: string
  showEmptyMessage?: boolean
}

export function SiteContactDetails({
  site,
  linkClassName = 'hover:underline',
  iconClassName = 'mt-0.5 size-4 shrink-0 text-muted-foreground',
  listClassName,
  emptyClassName = 'text-sm text-muted-foreground',
  showEmptyMessage = true,
}: Props) {
  const { email, phone } = site.contact ?? {}
  const formattedAddress = formatSiteAddress(site.contact)
  const hasDetails = hasSiteContactDetails(site.contact)

  if (!hasDetails) {
    if (!showEmptyMessage) {
      return null
    }

    return (
      <p className={emptyClassName}>
        Les coordonnées du restaurant seront bientôt disponibles ici.
      </p>
    )
  }

  return (
    <ul className={['space-y-4 text-sm', listClassName].filter(Boolean).join(' ')}>
      {formattedAddress ? (
        <li className="flex gap-3">
          <MapPin className={iconClassName} aria-hidden />
          <span className="whitespace-pre-line">{formattedAddress}</span>
        </li>
      ) : null}
      {phone ? (
        <li className="flex gap-3">
          <Phone className={iconClassName} aria-hidden />
          <a href={`tel:${phone.replace(/\s/g, '')}`} className={linkClassName}>
            {phone}
          </a>
        </li>
      ) : null}
      {email ? (
        <li className="flex gap-3">
          <Mail className={iconClassName} aria-hidden />
          <a href={`mailto:${email}`} className={linkClassName}>
            {email}
          </a>
        </li>
      ) : null}
    </ul>
  )
}
