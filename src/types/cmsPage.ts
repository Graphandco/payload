/**
 * Types CMS pages — conservés tant que la collection Pages est désactivée dans payload.config.
 * Réaligner sur @/payload-types quand Pages sera réactivée.
 */
import type { Media } from '@/payload-types'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type CmsBlockBase = {
  id?: string | null
  blockName?: string | null
  blockType: string
}

export type SimpleTextBlock = CmsBlockBase & {
  blockType: 'simpleText'
  text: string
}

export type SimpleParagraphBlock = CmsBlockBase & {
  blockType: 'simpleParagraph'
  paragraph: string
}

export type FormattedTextBlock = CmsBlockBase & {
  blockType: 'formattedText'
  content: SerializedEditorState
}

export type ImageBlock = CmsBlockBase & {
  blockType: 'image'
  image: number | Media
}

export type GalleryBlock = CmsBlockBase & {
  blockType: 'gallery'
  images: (number | Media)[]
}

export type ConditionalRepeaterItem =
  | {
      fieldType: 'textarea'
      textareaValue: string
      textValue?: null
    }
  | {
      fieldType: 'text'
      textValue: string
      textareaValue?: null
    }

export type ConditionalRepeaterBlock = CmsBlockBase & {
  blockType: 'conditionalRepeater'
  items: ConditionalRepeaterItem[]
}

export type CmsPageBlock =
  | SimpleTextBlock
  | SimpleParagraphBlock
  | FormattedTextBlock
  | ImageBlock
  | GalleryBlock
  | ConditionalRepeaterBlock

export type CmsPage = {
  id: number | string
  title: string
  slug: string
  layout: CmsPageBlock[]
}
