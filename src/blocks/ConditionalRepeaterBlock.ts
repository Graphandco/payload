import type { Block } from 'payload'

export const ConditionalRepeaterBlock: Block = {
  slug: 'conditionalRepeater',
  labels: {
    singular: 'Répéteur conditionnel',
    plural: 'Répéteurs conditionnels',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'fieldType',
          label: 'Type de champ',
          type: 'select',
          required: true,
          defaultValue: 'text',
          options: [
            {
              label: 'Texte simple',
              value: 'text',
            },
            {
              label: 'Paragraphe',
              value: 'textarea',
            },
          ],
        },
        {
          name: 'textValue',
          label: 'Texte',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.fieldType === 'text',
          },
        },
        {
          name: 'textareaValue',
          label: 'Paragraphe',
          type: 'textarea',
          admin: {
            condition: (_, siblingData) => siblingData?.fieldType === 'textarea',
          },
        },
      ],
    },
  ],
}
