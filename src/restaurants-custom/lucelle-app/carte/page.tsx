import { MenuView } from '@/components/menu/MenuView'
import { getCategoriesBySite } from '@/lib/getCategoriesBySite'
import { getProductsBySite } from '@/lib/getProductsBySite'
import { groupProductsByCategory } from '@/lib/groupProductsByCategory'
import type { Site } from '@/payload-types'

type Props = {
  site: Site
}

export default async function LucelleCartePage({ site }: Props) {
  const [categories, products] = await Promise.all([
    getCategoriesBySite(site.id),
    getProductsBySite(site.id),
  ])

  const sections = groupProductsByCategory(categories, products)

  return <MenuView site={site} sections={sections} />
}
