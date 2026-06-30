/**
 * Page cuisine custom Graph and Co (démo publique).
 *
 * Enregistrée dans loadCustomPage.ts (chemin « cuisine ») : elle remplace KitchenPage
 * pour ce slug uniquement, sans condition sur l'ID en base.
 *
 * Même flux que les autres sites (KitchenGate) + bandeau identifiants démo sous le sous-titre login.
 */
import { KitchenGate } from '@/components/kitchen/KitchenGate'
import { KitchenDemoBanner } from '@/restaurants-custom/graphandco/components/KitchenDemoBanner'
import type { Site } from '@/payload-types'

type Props = {
  site: Site
}

export default function GraphandcoKitchenPage({ site }: Props) {
  return <KitchenGate site={site} loginAfterSubtitle={<KitchenDemoBanner />} />
}
