/**
 * Point d'entrée serveur de /cuisine (tous les sites sauf override custom).
 *
 * Routage :
 *   [[...slug]]/page.tsx
 *     → loadCustomPage(slug, "cuisine") en priorité (ex. graphandco)
 *     → sinon KitchenPage ici
 *
 * KitchenPage délègue à KitchenGate (auth client + écran commandes).
 */
import { KitchenGate } from '@/components/kitchen/KitchenGate'
import type { Site } from '@/payload-types'

export const KITCHEN_PAGE_SLUG = 'cuisine'

type Props = {
  site: Site
}

export function KitchenPage({ site }: Props) {
  return <KitchenGate site={site} />
}

export function isKitchenPath(path: string): boolean {
  return path === KITCHEN_PAGE_SLUG
}
