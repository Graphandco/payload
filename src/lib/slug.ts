type SlugInput = {
  data?: Record<string, unknown>
  operation?: 'create' | 'update'
  originalDoc?: Record<string, unknown> | null
}

export const slugify = (value: string): string => {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export const createSlugFromField = (sourceField: string) => {
  return ({ data, operation, originalDoc }: SlugInput): Record<string, unknown> | undefined => {
    if (!data) {
      return data
    }

    const currentSlug = typeof data.slug === 'string' ? data.slug.trim() : ''
    if (currentSlug) {
      return {
        ...data,
        slug: slugify(currentSlug),
      }
    }

    if (operation === 'update' && originalDoc?.slug) {
      return data
    }

    const sourceValue = data[sourceField]
    if (typeof sourceValue !== 'string' || sourceValue.trim().length === 0) {
      return data
    }

    return {
      ...data,
      slug: slugify(sourceValue),
    }
  }
}
