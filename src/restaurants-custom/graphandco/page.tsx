/**
 * Vitrine click & collect Graph & Co — démo live pour prospects restaurateurs.
 */
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Site } from '@/payload-types'
import {
  CalendarClock,
  ChefHat,
  CreditCard,
  MousePointerClick,
  ShoppingBag,
  Smartphone,
  Store,
  UtensilsCrossed,
} from 'lucide-react'
import Link from 'next/link'
import GraphandcoHero from './components/home/Hero'
import GraphandcoFeatures from './components/home/Features'

type Props = {
  site: Site
}

const features = [
  {
    icon: UtensilsCrossed,
    title: 'Carte en ligne',
    description:
      'Vos plats, catégories et prix synchronisés depuis un back-office simple. Chaque restaurant gère son propre catalogue.',
  },
  {
    icon: ShoppingBag,
    title: 'Panier & commande',
    description:
      'Vos clients composent leur commande en quelques clics, depuis leur téléphone ou leur ordinateur.',
  },
  {
    icon: CalendarClock,
    title: 'Créneaux de retrait',
    description:
      "Choix de la date et de l'heure de collecte — vous gardez le contrôle sur votre planning cuisine.",
  },
  {
    icon: CreditCard,
    title: 'Paiement en ligne',
    description:
      'Encaissement sécurisé avant le retrait. Moins de no-shows, moins de caisse le jour J.',
  },
] as const

const steps = [
  {
    num: '01',
    title: 'On configure votre site',
    description:
      'Nom, domaine, carte, horaires et créneaux — nous adaptons la plateforme à votre établissement.',
  },
  {
    num: '02',
    title: 'Vos clients commandent',
    description:
      'Ils parcourent la carte, ajoutent au panier et choisissent leur créneau de retrait.',
  },
  {
    num: '03',
    title: 'Vous préparez sereinement',
    description:
      'Les commandes arrivent dans votre espace. Vous cuisinez au rythme des créneaux réservés.',
  },
] as const

const audiences = [
  { icon: ChefHat, label: 'Restaurants' },
  { icon: Store, label: 'Traiteurs' },
  { icon: Smartphone, label: 'Food trucks' },
  { icon: MousePointerClick, label: 'Corners cantine' },
] as const

export default function GraphandcoHomePage({ site }: Props) {
  return (
    <div className="graphandco-landing">
      {/* Hero */}
      <GraphandcoHero site={site} />

      {/* Features */}
      <GraphandcoFeatures features={features} />

      {/* How it works */}
      <section className="border-y border-border bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Comment ça marche</h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3">
            {steps.map((step) => (
              <li key={step.num}>
                <p className="text-3xl font-bold text-(--graphandco-accent-start)">{step.num}</p>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Audiences */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Pensé pour les professionnels de la restauration
          </h2>
          <ul className="mt-10 flex list-none flex-wrap justify-center gap-4 p-0">
            {audiences.map((item) => (
              <li key={item.label}>
                <Card>
                  <CardContent className="flex items-center gap-2 py-4 text-sm font-medium">
                    <item.icon className="size-4 text-primary" aria-hidden />
                    {item.label}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="graphandco-demo px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">Testez la démo sur ce site</h2>
          <p className="mt-4 leading-relaxed text-white/90">
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
                'border-white/30 bg-transparent text-inherit no-underline hover:bg-white/10',
              )}
            >
              Voir le panier
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
