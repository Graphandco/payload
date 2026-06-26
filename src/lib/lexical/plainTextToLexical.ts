/**
 * Convertit du texte brut en état Lexical pour l'import de menus (seed / prod).
 * Les paragraphes sont séparés par une ligne vide (\n\n).
 */
export function plainTextToLexical(text: string) {
  const paragraphs = text
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      children: paragraphs.map((paragraph) => ({
        type: 'paragraph',
        version: 1,
        direction: 'ltr' as const,
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        children: [
          {
            type: 'text',
            version: 1,
            text: paragraph.replace(/\n/g, ' '),
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
          },
        ],
      })),
    },
  }
}
