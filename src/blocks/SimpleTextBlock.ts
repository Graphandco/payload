import type { Block } from 'payload'

export const SimpleTextBlock: Block = {
  slug: 'simpleText',
  labels: {
    singular: 'Texte simple',
    plural: 'Textes simples',
  },
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
    },
  ],
}
