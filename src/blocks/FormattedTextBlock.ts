import type { Block } from 'payload'

export const FormattedTextBlock: Block = {
  slug: 'formattedText',
  labels: {
    singular: 'Texte formaté',
    plural: 'Textes formatés',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
}
