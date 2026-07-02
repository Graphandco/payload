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
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ domain: string; slug?: string[] }>
}

function resolvePagePath(slug?: string[]): string {
  return slug?.join('/') ?? ''
}

function isHomePath(path: string): boolean {
  return path === '' || path === 'accueil'
}

export default async function TenantPage({ params }: Props) {
  const { domain: tenantKey, slug } = await params
  const site = await getSiteByTenant(tenantKey)

  if (!site) {
    notFound()
  }

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
    const token = parseOrderTrackingToken(path)
    if (!token) {
      notFound()
    }

    return <OrderTrackingPage site={site} token={token} />
  }

  if (isKitchenPath(path)) {
    return <KitchenPage site={site} />
  }

  if (isOrdersPath(path)) {
    return <OrdersPage site={site} />
  }

  const page = await getPageBySiteAndSlug(site.id, path)
  if (!page) {
    notFound()
  }

  return <CmsPageView page={page} site={site} />
}
