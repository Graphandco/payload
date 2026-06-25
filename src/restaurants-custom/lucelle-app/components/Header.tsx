import type { Site } from '@/payload-types'
import Link from 'next/link'

type Props = {
  site: Site
}

export function LucelleHeader({ site }: Props) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1rem 1.5rem',
        borderBottom: '2px solid #1a1a1a',
        background: '#faf8f5',
      }}
    >
      <Link href="/" style={{ fontWeight: 700, fontSize: '1.25rem', textDecoration: 'none', color: 'inherit' }}>
        {site.name}
      </Link>
      <nav style={{ display: 'flex', gap: '1.25rem', fontSize: '0.95rem' }}>
        <Link href="/">Accueil</Link>
        <Link href="/carte">Carte</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  )
}
