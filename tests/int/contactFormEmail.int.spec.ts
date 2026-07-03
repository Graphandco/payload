import { describe, expect, it } from 'vitest'
import { sendContactFormEmail } from '@/lib/contact/submitContactForm'

describe('sendContactFormEmail', () => {
  it('rejects when restaurant contact email is missing', async () => {
    await expect(
      sendContactFormEmail(
        { name: 'Test', contact: {} },
        { name: 'Jean', email: 'jean@exemple.fr', message: 'Bonjour' },
      ),
    ).rejects.toMatchObject({
      code: 'CONTACT_EMAIL_MISSING',
    })
  })
})
