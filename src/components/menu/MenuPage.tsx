/**
 * Page serveur /carte : charge produits et catégories du site,
 * les groupe par catégorie puis délègue l'affichage à MenuView.
 */
import { MenuView } from '@/components/menu/MenuView'
import { getCategoriesBySite } from '@/lib/getCategoriesBySite'
import { getProductsBySite } from '@/lib/getProductsBySite'
import { groupProductsByCategory } from '@/lib/groupProductsByCategory'
import type { Site } from '@/payload-types'

export const MENU_PAGE_SLUG = 'carte'

type Props = {
  site: Site
}

export async function MenuPage({ site }: Props) {
  const [categories, products] = await Promise.all([
    getCategoriesBySite(site.id),
    getProductsBySite(site.id),
  ])

  const sections = groupProductsByCategory(categories, products)

  return <MenuView site={site} sections={sections} />
}

export function isMenuPath(path: string): boolean {
  return path === MENU_PAGE_SLUG
}
