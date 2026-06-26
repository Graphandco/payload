import { plainTextToLexical } from '@/lib/lexical/plainTextToLexical'
import type { Category } from '@/payload-types'

/** Texte brut ou état Lexical déjà sérialisé (export Payload). */
export type RichTextImport = string | Category['description']

export function resolveRichText(value: RichTextImport | null | undefined): Category['description'] {
  if (value == null || value === '') {
    return undefined
  }

  if (typeof value === 'string') {
    return plainTextToLexical(value) as Category['description']
  }

  return value
}
