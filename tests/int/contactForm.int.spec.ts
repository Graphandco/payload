import { describe, expect, it } from 'vitest'
import { buildContactFormContent } from '@/lib/email/buildContactFormContent'

describe('buildContactFormContent', () => {
  it('builds subject and body with visitor details', () => {
    const content = buildContactFormContent('Mama Pizza', {
      name: 'Jean Dupont',
      email: 'jean@exemple.fr',
      message: 'Bonjour,\nJe souhaite réserver une table.',
    })

    expect(content.subject).toBe('[Contact] Nouveau message — Mama Pizza')
    expect(content.text).toContain('Jean Dupont')
    expect(content.text).toContain('jean@exemple.fr')
    expect(content.text).toContain('Je souhaite réserver une table.')
    expect(content.html).toContain('Jean Dupont')
    expect(content.html).toContain('jean@exemple.fr')
    expect(content.html).toContain('Je souhaite réserver une table.')
  })

  it('escapes html in user input', () => {
    const content = buildContactFormContent('Test', {
      name: '<script>',
      email: 'a@b.fr',
      message: 'Hello & goodbye',
    })

    expect(content.html).not.toContain('<script>')
    expect(content.html).toContain('&lt;script&gt;')
    expect(content.html).toContain('Hello &amp; goodbye')
  })
})
