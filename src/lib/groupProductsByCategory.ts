import type { Category, Product } from '@/payload-types'

export type MenuSection = {
  category: Category | null
  products: Product[]
}

function getCategoryId(category: number | Category): number {
  return typeof category === 'object' ? category.id : category
}

export function groupProductsByCategory(categories: Category[], products: Product[]): MenuSection[] {
  const assignedProductIds = new Set<number>()

  const sections: MenuSection[] = categories
    .map((category) => {
      const categoryProducts = products.filter((product) => {
        if (assignedProductIds.has(product.id)) {
          return false
        }

        const belongsToCategory = product.categories?.some(
          (entry) => getCategoryId(entry) === category.id,
        )

        if (belongsToCategory) {
          assignedProductIds.add(product.id)
        }

        return belongsToCategory
      })

      return { category, products: categoryProducts }
    })
    .filter((section) => section.products.length > 0)

  const uncategorized = products.filter((product) => !assignedProductIds.has(product.id))

  if (uncategorized.length > 0) {
    sections.push({ category: null, products: uncategorized })
  }

  return sections
}
