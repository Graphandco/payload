import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { KitchenOrderTableRow } from '@/components/kitchen/KitchenOrderTableRow'
import type { KitchenOrder, KitchenOrderAction, KitchenOrderGroup } from '@/lib/kitchen/kitchenOrderTypes'

type Props = {
  group: KitchenOrderGroup
  updatingOrderId: number | null
  onRequestAction: (order: KitchenOrder, status: KitchenOrderAction) => void
}

export function KitchenSlotTable({ group, updatingOrderId, onRequestAction }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold">{group.pickupSlotLabel}</h2>
        <span className="text-sm text-muted-foreground">
          {group.orders.length} commande{group.orders.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Commande</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead className="text-center">Paiement</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {group.orders.map((order) => (
              <KitchenOrderTableRow
                key={order.id}
                order={order}
                isUpdating={updatingOrderId === order.id}
                onRequestAction={onRequestAction}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
