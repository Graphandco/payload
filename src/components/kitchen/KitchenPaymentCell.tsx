import { formatPrice } from '@/lib/formatPrice'
import type { KitchenOrder } from '@/lib/kitchen/kitchenOrderTypes'
import { Check, X } from 'lucide-react'

type Props = {
  order: KitchenOrder
}

export function KitchenPaymentCell({ order }: Props) {
  const isPaid = order.paymentStatus === 'paid'

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="text-base font-semibold tabular-nums">{formatPrice(order.total)}</span>
      {isPaid ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
          <Check className="size-5 stroke-[2.5]" aria-hidden />
          <span className="sr-only">Payée</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
          <X className="size-5 stroke-[2.5]" aria-hidden />
          <span className="sr-only">Non payée</span>
        </span>
      )}
    </div>
  )
}
