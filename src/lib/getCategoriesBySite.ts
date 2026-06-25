import configPromise from '@payload-config'
import type { Category } from '@/payload-types'
import { getPayload } from 'payload'

export async function getCategoriesBySite(siteId: number | string): Promise<Category[]> {
  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'categories',
    where: {
      site: { equals: siteId },
    },
    sort: 'name',
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })

  return result.docs
}
