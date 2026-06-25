import { CartBadge } from '@/components/cart/CartBadge'
import type { Site } from '@/payload-types'
import Link from 'next/link'

type Props = {
  site: Site
}

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/carte', label: 'Carte' },
  { href: '/contact', label: 'Contact' },
]

export function LucelleHeader({ site }: Props) {
  return (
    <header className="lucelle-header flex items-center justify-between gap-4 px-6 py-4">
      <Link href="/" className="lucelle-logo text-xl font-bold text-inherit no-underline">
        {site.name}
      </Link>
      <div className="flex items-center gap-5">
        <nav className="lucelle-nav flex gap-5 text-sm">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <CartBadge siteId={site.id} className="lucelle-nav text-sm" />
      </div>
    </header>
  )
}
