export type SiteNavLink = {
  href: string
  label: string
}

export const defaultSiteNavLinks: SiteNavLink[] = [
  { href: '/', label: 'Accueil' },
  { href: '/carte', label: 'Carte' },
  { href: '/contact', label: 'Contact' },
]
