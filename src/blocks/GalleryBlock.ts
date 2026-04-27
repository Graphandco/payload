import type { Block } from 'payload'

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: {
    singular: 'Galerie',
    plural: 'Galeries',
  },
  fields: [
    {
      name: 'images',
      label: 'Images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
    },
  ],
}
