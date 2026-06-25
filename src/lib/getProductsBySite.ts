import configPromise from '@payload-config'
import type { Product } from '@/payload-types'
import { getPayload } from 'payload'

type GetProductsBySiteOptions = {
  categoryId?: number | string
}

export async function getProductsBySite(
  siteId: number | string,
  options: GetProductsBySiteOptions = {},
): Promise<Product[]> {
  const payload = await getPayload({
    config: configPromise,
  })

  const where: {
    site: { equals: number | string }
    categories?: { contains: number | string }
  } = {
    site: { equals: siteId },
  }

  if (options.categoryId !== undefined) {
    where.categories = { contains: options.categoryId }
  }

  const result = await payload.find({
    collection: 'products',
    where,
    sort: 'name',
    depth: 2,
    pagination: false,
    overrideAccess: true,
  })

  return result.docs
}
