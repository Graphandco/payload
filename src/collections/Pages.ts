import type { CollectionConfig } from 'payload'
import {
  ConditionalRepeaterBlock,
  FormattedTextBlock,
  GalleryBlock,
  ImageBlock,
  SimpleParagraphBlock,
  SimpleTextBlock,
} from '../blocks'
import {
  createAssignDefaultSiteBeforeChange,
  createSiteField,
  createPublicSiteScopedCollectionAccess,
} from '../lib/siteAccess'
import { createSlugFromField } from '../lib/slug'

const siteAccess = createPublicSiteScopedCollectionAccess('pages')

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: siteAccess,
  fields: [
    createSiteField(),
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenu',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              required: true,
              blocks: [
                SimpleTextBlock,
                SimpleParagraphBlock,
                FormattedTextBlock,
                ImageBlock,
                ConditionalRepeaterBlock,
                GalleryBlock,
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seoMetaTitle',
              label: 'SEO Meta Title',
              type: 'textarea',
            },
            {
              name: 'seoMetaDescription',
              label: 'SEO Meta Description',
              type: 'textarea',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [createSlugFromField('title')],
    beforeChange: [createAssignDefaultSiteBeforeChange()],
  },
}
