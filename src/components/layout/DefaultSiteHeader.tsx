/**
 * En-tête du shell par défaut : logo, navigation et badge panier.
 */
import { CartBadge } from '@/components/cart/CartBadge'
import { BurgerMenu } from '@/components/navigation/BurgerMenu'
import { defaultSiteNavLinks } from '@/lib/siteNav'
import type { Site } from '@/payload-types'

type Props = {
  site: Site
}

export function DefaultSiteHeader({ site }: Props) {
  return (
    <header className="default-header sticky top-0 z-30">
      <div className="mx-auto max-w-5xl p-4">
        <BurgerMenu
          siteName={site.name}
          links={defaultSiteNavLinks}
          actions={<CartBadge siteId={site.id} className="default-nav-link text-sm font-medium" />}
          logoClassName="default-logo"
          navClassName="default-nav"
          linkClassName="default-nav-link"
          panelClassName="default-burger-panel"
          buttonClassName="default-burger-btn"
        />
      </div>
    </header>
  )
}
