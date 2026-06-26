import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Site } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import heroImage from '../../assets/img/hero.svg'

type Props = {
  site: Site
}

export default function GraphandcoHero({ site }: Props) {
  return (
    <section className="border-b border-border bg-linear-to-br from-background via-[#e8faf4] to-secondary/35 px-4 pt-8 sm:pt-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[3fr_2fr]">
          <div className="pb-8 sm:pb-12">
            <p className="mb-6 inline-block rounded-full border border-primary/20 bg-secondary/45 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
              Solution click &amp; collect
            </p>
            <h1 className="text-4xl leading-[1.15] font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Votre click &amp; collect,
              <br />
              clé en main.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Permettez à vos clients de commander en ligne et de récupérer leur commande au créneau
              qui leur convient. Carte, panier, créneaux de retrait et paiement — le tout sur votre
              site, à votre image.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/carte"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'graphandco-btn-primary no-underline',
                )}
              >
                Voir la démo live
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'graphandco-btn-outline no-underline',
                )}
              >
                Nous contacter
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Vous êtes sur la démo <strong>{site.name}</strong> — parcourez la carte comme vos
              futurs clients.
            </p>
          </div>
          <Image
            src={heroImage}
            alt="Illustration d'une commande en ligne à retirer au restaurant"
            width={500}
            height={500}
            className="h-auto w-full object-contain"
            priority
            unoptimized
          />
        </div>
      </div>
    </section>
  )
}
