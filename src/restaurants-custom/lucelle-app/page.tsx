import type { Site } from '@/payload-types'
import Link from 'next/link'

type Props = {
  site: Site
}

export default function LucelleHomePage({ site }: Props) {
  return (
    <section>
      <p style={{ opacity: 0.7, marginTop: 0 }}>Page d&apos;accueil custom</p>
      <h1 style={{ marginTop: '0.5rem' }}>Bienvenue chez {site.name}</h1>
      <p>
        Accueil sur-mesure Lucelle. Les pages contact passent par le CMS ; la carte est une page
        custom.
      </p>
      <p>
        <Link href="/carte">Voir la carte →</Link>
      </p>
    </section>
  )
}
