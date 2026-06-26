/**
 * Point d'entrée serveur de /cuisine : passe le site à KitchenView.
 */
import { KitchenView } from '@/components/kitchen/KitchenView'
import type { Site } from '@/payload-types'

export const KITCHEN_PAGE_SLUG = 'cuisine'

type Props = {
  site: Site
}

export function KitchenPage({ site }: Props) {
  return <KitchenView site={site} />
}

export function isKitchenPath(path: string): boolean {
  return path === KITCHEN_PAGE_SLUG
}
