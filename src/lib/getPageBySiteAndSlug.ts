import configPromise from '@payload-config'
import type { Page } from '@/payload-types'
import { getPayload } from 'payload'

export async function getPageBySiteAndSlug(
  siteId: number | string,
  pageSlug: string,
): Promise<Page | null> {
  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'pages',
    where: {
      and: [{ site: { equals: siteId } }, { slug: { equals: pageSlug } }],
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })

  return result.docs[0] ?? null
}
