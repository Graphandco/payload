import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import type { Site } from '@/payload-types'

const site: Pick<Site, 'name' | 'contact'> = {
  name: 'Mama Pizza',
  contact: {
    email: 'contact@mamapizza.fr',
  },
}

describe('resolveEmailSender', () => {
  const envBackup = { ...process.env }

  beforeEach(() => {
    process.env.EMAIL_PLATFORM_FROM_ADDRESS = 'noreply@youclickyoucollect.fr'
    process.env.EMAIL_PLATFORM_FROM_NAME = 'Graph and Co'
  })

  afterEach(() => {
    process.env = { ...envBackup }
  })

  it('uses site name as From name and platform email as From address', async () => {
    const { resolveEmailSender } = await import('@/lib/email/resolveEmailSender')
    const sender = resolveEmailSender(site)

    expect(sender.from).toEqual({
      name: 'Mama Pizza',
      email: 'noreply@youclickyoucollect.fr',
    })
    expect(sender.replyTo).toBe('contact@mamapizza.fr')
  })

  it('omits replyTo when contact email is missing', async () => {
    const { resolveEmailSender } = await import('@/lib/email/resolveEmailSender')
    const sender = resolveEmailSender({ name: 'Test', contact: {} })

    expect(sender.replyTo).toBeUndefined()
  })
})

describe('isEmailTestRouteEnabled', () => {
  it('is false without EMAIL_TEST_SECRET', async () => {
    const previous = process.env.EMAIL_TEST_SECRET
    delete process.env.EMAIL_TEST_SECRET

    const { isEmailTestRouteEnabled } = await import('@/lib/email/brevoConfig')
    expect(isEmailTestRouteEnabled()).toBe(false)

    if (previous === undefined) {
      delete process.env.EMAIL_TEST_SECRET
    } else {
      process.env.EMAIL_TEST_SECRET = previous
    }
  })
})
