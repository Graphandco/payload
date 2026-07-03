/**
 * Résolution page CMS par site + slug.
 * Collection Pages désactivée : retourne null jusqu'à réactivation dans payload.config.
 */
import type { CmsPage } from '@/types/cmsPage'

export async function getPageBySiteAndSlug(
  _siteId: number | string,
  _pageSlug: string,
): Promise<CmsPage | null> {
  return null
}
