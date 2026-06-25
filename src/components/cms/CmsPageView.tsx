/**
 * Rendu d'une page CMS Payload : titre + blocs de contenu (RenderBlocks).
 */
import { RenderBlocks } from '@/components/cms/RenderBlocks'
import type { Page, Site } from '@/payload-types'

type Props = {
  page: Page
  site: Site
}

export function CmsPageView({ page }: Props) {
  return (
    <article className="cms-page">
      <h1>{page.title}</h1>
      <div className="cms-content">
        <RenderBlocks blocks={page.layout} />
      </div>
    </article>
  )
}
