import type { Order } from '@/payload-types'
import type { KitchenOrderLineGroup } from '@/lib/kitchen/kitchenOrderTypes'

function getPrimaryCategoryName(line: NonNullable<Order['lines']>[number]): string {
  const product = line.product

  if (!product || typeof product === 'number') {
    return 'Autres'
  }

  const categories = product.categories
  if (!Array.isArray(categories) || categories.length === 0) {
    return 'Autres'
  }

  const first = categories[0]
  if (typeof first === 'object' && first !== null && first.name) {
    return first.name
  }

  return 'Autres'
}

export function groupOrderLinesByCategory(order: Order): KitchenOrderLineGroup[] {
  const groups = new Map<string, KitchenOrderLineGroup['lines']>()

  for (const line of order.lines ?? []) {
    const categoryName = getPrimaryCategoryName(line)
    const existing = groups.get(categoryName) ?? []
    existing.push({ name: line.name, quantity: line.quantity })
    groups.set(categoryName, existing)
  }

  return [...groups.entries()]
    .map(([categoryName, lines]) => ({ categoryName, lines }))
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName, 'fr'))
}
