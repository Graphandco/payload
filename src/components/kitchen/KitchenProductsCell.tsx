import type { KitchenOrder } from '@/lib/kitchen/kitchenOrderTypes'

type Props = {
  order: KitchenOrder
}

export function KitchenProductsCell({ order }: Props) {
  if (order.lineGroups.length === 0) {
    return <span className="text-sm text-muted-foreground">Aucun article</span>
  }

  return (
    <div className="space-y-3">
      {order.lineGroups.map((group) => (
        <div key={`${order.id}-${group.categoryName}`}>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {group.categoryName}
          </p>
          <ul className="mt-1 list-none space-y-0.5 p-0 text-sm">
            {group.lines.map((line, index) => (
              <li key={`${order.id}-${group.categoryName}-${line.name}-${index}`}>
                <span className="font-medium tabular-nums">{line.quantity}×</span> {line.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
