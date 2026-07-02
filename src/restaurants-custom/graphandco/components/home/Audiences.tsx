import { Card, CardContent } from '@/components/ui/card'
import { ChefHat, MousePointerClick, Smartphone, Store, type LucideIcon } from 'lucide-react'

type Audience = {
  icon: LucideIcon
  label: string
}

const audiences: readonly Audience[] = [
  { icon: ChefHat, label: 'Restaurants' },
  { icon: Store, label: 'Traiteurs' },
  { icon: Smartphone, label: 'Food trucks' },
  { icon: MousePointerClick, label: 'Corners cantine' },
]

export default function Audiences() {
  return (
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
  )
}
