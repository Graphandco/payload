import type { Site } from '@/payload-types'
import Link from 'next/link'

type Props = {
  site: Site
}

export default function LucelleHomePage({ site }: Props) {
  return (
    <section className="space-y-4">
      <p className="text-sm text-neutral-600">Page d&apos;accueil custom</p>
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Bienvenue chez {site.name}</h1>
      <p className="leading-relaxed text-neutral-700">
        Accueil sur-mesure Lucelle. Les pages contact passent par le CMS ; la carte est une page
        custom.
      </p>
      <p>
        <Link href="/carte" className="lucelle-link">
          Voir la carte →
        </Link>
      </p>
    </section>
  )
}
