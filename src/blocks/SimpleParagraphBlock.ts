import type { Block } from 'payload'

export const SimpleParagraphBlock: Block = {
  slug: 'simpleParagraph',
  labels: {
    singular: 'Paragraphe simple',
    plural: 'Paragraphes simples',
  },
  fields: [
    {
      name: 'paragraph',
      type: 'textarea',
      required: true,
    },
  ],
}
