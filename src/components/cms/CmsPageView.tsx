import { RenderBlocks } from '@/components/cms/RenderBlocks'
import type { Page, Site } from '@/payload-types'

type Props = {
  page: Page
  site: Site
}

export function CmsPageView({ page }: Props) {
  return (
    <>
      <h1>{page.title}</h1>
      <RenderBlocks blocks={page.layout} />
    </>
  )
}
