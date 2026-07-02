import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function DemoCTA() {
  return (
    <section className="bg-secondary/20 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-semibold sm:text-3xl">Testez la démo sur ce site</h2>
        <p className="mt-4 leading-relaxed">
          Ajoutez des plats au panier, parcourez la carte et imaginez l&apos;expérience de vos
          clients. C&apos;est exactement ce que nous déployons pour chaque restaurant partenaire.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/carte"
            className={cn(buttonVariants({ size: 'lg' }), 'graphandco-btn-primary no-underline')}
          >
            Explorer la carte
          </Link>
          <Link
            href="/panier"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'graphandco-btn-outline no-underline',
            )}
          >
            Voir le panier
          </Link>
        </div>
      </div>
    </section>
  )
}
