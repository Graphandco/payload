import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ChefHat, ClipboardList, type LucideIcon } from 'lucide-react'
import Link from 'next/link'

type StaffSpace = {
  icon: LucideIcon
  title: string
  description: string
  href: string
  linkLabel: string
  highlights: readonly string[]
}

const staffSpaces: readonly StaffSpace[] = [
  {
    icon: ChefHat,
    title: 'Écran cuisine',
    description:
      'Vue opérationnelle pour l’équipe en production : ce qui doit être préparé, créneau par créneau.',
    href: '/cuisine',
    linkLabel: 'Voir la démo cuisine',
    highlights: [
      'Connexion staff sécurisée',
      'Commandes regroupées par créneau de retrait',
      'Indicateur de paiement (payée / en attente)',
      'Marquer une commande comme terminée ou annulée',
    ],
  },
  {
    icon: ClipboardList,
    title: 'Suivi & factures',
    description:
      'Historique et exports pour la comptabilité ou l’administration : retrouver une commande et éditer les factures.',
    href: '/commandes',
    linkLabel: 'Voir la démo commandes',
    highlights: [
      'Liste paginée avec recherche par n° de commande ou de facture',
      'Téléchargement de la facture PDF par commande payée',
      'Export ZIP des factures sur une période',
      'Numéro de facture attribué automatiquement au paiement',
    ],
  },
]

export default function StaffSpaces() {
  return (
    <section className="bg-secondary/20 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Cuisine &amp; commandes : vos outils du quotidien
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Deux espaces staff sécurisés, accessibles depuis votre site — pour la production en
          cuisine et la gestion administrative après coup.
        </p>
        <ul className="mt-10 grid list-none gap-6 p-0 lg:grid-cols-2">
          {staffSpaces.map((space) => {
            const Icon = space.icon

            return (
              <li key={space.title}>
                <Card className="flex h-full flex-col">
                  <CardContent className="flex flex-1 flex-col">
                    <span className="mb-4 flex size-11 items-center justify-center rounded-lg bg-secondary/35 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <CardTitle className="text-lg">{space.title}</CardTitle>
                    <CardDescription className="mt-2 text-sm leading-relaxed">
                      {space.description}
                    </CardDescription>
                    <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                      {space.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <Link
                        href={space.href}
                        className={cn(
                          buttonVariants({ variant: 'outline', size: 'sm' }),
                          'no-underline',
                        )}
                      >
                        {space.linkLabel}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
