/**
 * En-tête du shell par défaut : logo, navigation et badge panier.
 */
import { CartBadge } from '@/components/cart/CartBadge'
import { BurgerMenu } from '@/components/navigation/BurgerMenu'
import { defaultSiteNavLinks } from '@/lib/siteNav'
import type { Media, Site } from '@/payload-types'

type Props = {
  site: Site
}

function resolveMedia(media: number | Media | null | undefined): Media | null {
  return typeof media === 'object' && media !== null ? media : null
}

export function DefaultSiteHeader({ site }: Props) {
  const logo = resolveMedia(site.logo)

  return (
    <header className="default-header sticky top-0 z-30">
      <div className="mx-auto max-w-5xl p-4">
        <BurgerMenu
          siteName={site.name}
          logoUrl={logo?.url}
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
