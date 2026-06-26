import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

export type GraphandcoFeature = {
  icon: LucideIcon
  title: string
  description: string
}

type Props = {
  features: ReadonlyArray<GraphandcoFeature>
}

export default function GraphandcoFeatures({ features }: Props) {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Tout ce qu&apos;il faut pour vendre à emporter
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Pas de marketplace qui vous prend une commission sur chaque commande : votre site, votre
          marque, vos clients.
        </p>
        <ul className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <li key={feature.title}>
                <Card className="h-full">
                  <CardContent>
                    <span className="mb-4 flex size-11 items-center justify-center rounded-lg bg-secondary/35 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="mt-2 text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
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
