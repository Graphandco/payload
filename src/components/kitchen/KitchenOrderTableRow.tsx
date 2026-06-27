import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { KitchenPaymentCell } from '@/components/kitchen/KitchenPaymentCell'
import { KitchenProductsCell } from '@/components/kitchen/KitchenProductsCell'
import type { KitchenOrder, KitchenOrderAction } from '@/lib/kitchen/kitchenOrderTypes'

type Props = {
  order: KitchenOrder
  isUpdating: boolean
  onRequestAction: (order: KitchenOrder, status: KitchenOrderAction) => void
}

export function KitchenOrderTableRow({ order, isUpdating, onRequestAction }: Props) {
  return (
    <TableRow>
      <TableCell className="min-w-40">
        <div className="space-y-1">
          <p className="text-base font-semibold">{order.displayNumber}</p>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
        </div>
      </TableCell>
      <TableCell className="min-w-60">
        <KitchenProductsCell order={order} />
      </TableCell>
      <TableCell className="w-32">
        <KitchenPaymentCell order={order} />
      </TableCell>
      <TableCell className="min-w-48">
        <div className="flex gap-2">
          <Button
            type="button"
            disabled={isUpdating}
            className="h-12 flex-1 bg-red-600 text-white hover:bg-red-700"
            onClick={() => onRequestAction(order, 'cancelled')}
          >
            Annuler
          </Button>
          <Button
            type="button"
            disabled={isUpdating}
            className="h-12 flex-[1.6] bg-green-600 text-white hover:bg-green-700"
            onClick={() => onRequestAction(order, 'completed')}
          >
            Confirmer
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
