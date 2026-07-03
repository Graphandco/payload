/**
 * Mappe les blocs Payload (texte, image, galerie…) vers des composants React front.
 */
import type { CmsPageBlock } from '@/types/cmsPage'
import type { Media } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

type PageBlock = CmsPageBlock

function resolveMedia(media: number | Media): Media | null {
  return typeof media === 'object' && media !== null ? media : null
}

function BlockImage({ media }: { media: number | Media }) {
  const file = resolveMedia(media)
  if (!file?.url) {
    return null
  }

  return (
    <figure>
      <Image
        src={file.url}
        alt={file.alt ?? ''}
        width={file.width ?? 800}
        height={file.height ?? 600}
        style={{ width: '100%', height: 'auto' }}
      />
    </figure>
  )
}

export function RenderBlocks({ blocks }: { blocks: PageBlock[] }) {
  return (
    <div>
      {blocks.map((block, index) => {
        const key = block.id ?? `${block.blockType}-${index}`

        switch (block.blockType) {
          case 'simpleText':
            return <p key={key}>{block.text}</p>
          case 'simpleParagraph':
            return <p key={key}>{block.paragraph}</p>
          case 'formattedText':
            return (
              <div key={key}>
                <RichText data={block.content} />
              </div>
            )
          case 'image':
            return (
              <div key={key}>
                <BlockImage media={block.image} />
              </div>
            )
          case 'gallery':
            return (
              <div key={key} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {block.images.map((image, imageIndex) => (
                  <BlockImage key={`${key}-${imageIndex}`} media={image} />
                ))}
              </div>
            )
          case 'conditionalRepeater':
            return (
              <div key={key}>
                {block.items.map((item, itemIndex) => {
                  if (item.fieldType === 'textarea') {
                    return <p key={`${key}-${itemIndex}`}>{item.textareaValue}</p>
                  }

                  return <p key={`${key}-${itemIndex}`}>{item.textValue}</p>
                })}
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
