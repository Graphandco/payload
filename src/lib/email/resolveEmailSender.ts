/**
 * Expéditeur et Reply-To par site (fallback plateforme dans le .env).
 */
import type { Site } from '@/payload-types'
import { getPlatformFromEmail, getPlatformFromName } from '@/lib/email/brevoConfig'

export type ResolvedEmailSender = {
  from: {
    name: string
    email: string
  }
  replyTo?: string
}

export function resolveEmailSender(
  site: Pick<Site, 'name' | 'contact'>,
): ResolvedEmailSender {
  const fromEmail = getPlatformFromEmail()
  const fromName = site.name?.trim() || getPlatformFromName() || 'Click & Collect'

  const replyTo = site.contact?.email?.trim()

  return {
    from: {
      name: fromName,
      email: fromEmail,
    },
    ...(replyTo ? { replyTo } : {}),
  }
}
