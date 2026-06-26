import type { KitchenOrder, KitchenOrderGroup } from '@/lib/kitchen/kitchenOrderTypes'

function sortOrdersByPickupSlot(orders: KitchenOrder[]): KitchenOrder[] {
  return [...orders].sort((a, b) => {
    const dateCompare = a.pickupSlotValue.localeCompare(b.pickupSlotValue)
    if (dateCompare !== 0) {
      return dateCompare
    }

    return a.createdAt.localeCompare(b.createdAt)
  })
}

export function groupKitchenOrdersBySlot(orders: KitchenOrder[]): KitchenOrderGroup[] {
  const sorted = sortOrdersByPickupSlot(orders)
  const groups = new Map<string, KitchenOrderGroup>()

  for (const order of sorted) {
    const existing = groups.get(order.pickupSlotValue)
    if (existing) {
      existing.orders.push(order)
      continue
    }

    groups.set(order.pickupSlotValue, {
      pickupSlotValue: order.pickupSlotValue,
      pickupSlotLabel: order.pickupSlotLabel,
      orders: [order],
    })
  }

  return [...groups.values()]
}
