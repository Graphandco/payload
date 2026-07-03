/**
 * Routeur principal du front multi-tenant.
 * Résout chaque URL ({slug}.localhost/chemin) vers : accueil custom, page CMS,
 * page React custom, routes métier partagées (/carte, /panier, /cuisine) ou 404.
 */
import { CmsPageView } from '@/components/cms/CmsPageView'
import { CartPage, isCartPath } from '@/components/cart/CartPage'
import { CheckoutPage, isCheckoutPath } from '@/components/checkout/CheckoutPage'
import { ContactPage, isContactPath } from '@/components/contact/ContactPage'
import {
  MentionsLegalesPage,
  PrivacyPolicyPage,
  isMentionsLegalesPath,
  isPrivacyPolicyPath,
} from '@/components/legal/LegalPages'
import { KitchenPage, isKitchenPath } from '@/components/kitchen/KitchenPage'
import { OrdersPage, isOrdersPath } from '@/components/orders/OrdersPage'
import { isMenuPath, MenuPage } from '@/components/menu/MenuPage'
import {
  OrderTrackingPage,
  isOrderTrackingPath,
  parseOrderTrackingToken,
} from '@/components/order-tracking/OrderTrackingPage'
import { getPageBySiteAndSlug } from '@/lib/getPageBySiteAndSlug'
import { getSiteByTenant } from '@/lib/getSiteByTenant'
import { loadCustomHome } from '@/lib/loadCustomHome'
import { loadCustomPage } from '@/lib/loadCustomPage'
import { requireDefined, requireSite } from '@/lib/requireSite'
import { resolveDomainPageMetadata } from '@/lib/seo/domainPageSeo'
import { resolveTenantPathFromSlug } from '@/lib/seo/tenantPageSeo'

function resolvePagePath(slug?: string[]): string {
  return resolveTenantPathFromSlug(slug)
}

export async function generateMetadata({
  params,
}: Pick<PageProps<'/[domain]/[[...slug]]'>, 'params'>) {
  const { domain: tenantKey, slug } = await params
  return resolveDomainPageMetadata(tenantKey, slug)
}

function isHomePath(path: string): boolean {
  return path === '' || path === 'accueil'
}

export default async function TenantPage({ params }: PageProps<'/[domain]/[[...slug]]'>) {
  const { domain: tenantKey, slug } = await params
  const site = requireSite(await getSiteByTenant(tenantKey))
  const path = resolvePagePath(slug)

  if (isHomePath(path)) {
    const CustomHome = await loadCustomHome(site.slug)
    if (CustomHome) {
      return <CustomHome site={site} />
    }

    const homePage = await getPageBySiteAndSlug(site.id, 'accueil')
    if (homePage) {
      return <CmsPageView page={homePage} site={site} />
    }

    return (
      <>
        <h1>{site.name}</h1>
        <p>Aucune page d&apos;accueil configurée.</p>
      </>
    )
  }

  const CustomPage = await loadCustomPage(site.slug, path)
  if (CustomPage) {
    return <CustomPage site={site} />
  }

  if (isMenuPath(path)) {
    return <MenuPage site={site} />
  }

  if (isCartPath(path)) {
    return <CartPage site={site} />
  }

  if (isContactPath(path)) {
    return <ContactPage site={site} />
  }

  if (isMentionsLegalesPath(path)) {
    return <MentionsLegalesPage site={site} />
  }

  if (isPrivacyPolicyPath(path)) {
    return <PrivacyPolicyPage site={site} />
  }

  if (isCheckoutPath(path)) {
    return <CheckoutPage site={site} />
  }

  if (isOrderTrackingPath(path)) {
    const token = requireDefined(parseOrderTrackingToken(path))
    return <OrderTrackingPage site={site} token={token} />
  }

  if (isKitchenPath(path)) {
    return <KitchenPage site={site} />
  }

  if (isOrdersPath(path)) {
    return <OrdersPage site={site} />
  }

  const page = requireDefined(await getPageBySiteAndSlug(site.id, path))
  return <CmsPageView page={page} site={site} />
}
