/**
 * Envoi transactionnel via l'API Brevo (v3/smtp/email).
 */
import type { Site } from '@/payload-types'
import { EmailConfigError, getBrevoApiKey } from '@/lib/email/brevoConfig'
import { resolveEmailSender } from '@/lib/email/resolveEmailSender'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

export type SendEmailViaBrevoInput = {
  to: string
  subject: string
  html: string
  text?: string
  site: Pick<Site, 'name' | 'contact'>
  /** Défaut : true. Mettre à false pour les mails sans réponse attendue (ex. confirmation commande). */
  includeReplyTo?: boolean
  /** Remplace le Reply-To issu de resolveEmailSender (ex. email du visiteur sur le formulaire contact). */
  replyTo?: string | { email: string; name?: string }
}

export class SendEmailError extends Error {
  statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'SendEmailError'
    this.statusCode = statusCode
  }
}

export async function sendEmailViaBrevo(input: SendEmailViaBrevoInput): Promise<{ messageId?: string }> {
  let apiKey: string

  try {
    apiKey = getBrevoApiKey()
  } catch (error) {
    if (error instanceof EmailConfigError) {
      throw new SendEmailError(error.message)
    }

    throw error
  }

  const { from, replyTo: defaultReplyTo } = resolveEmailSender(input.site)
  const replyToOverride = input.replyTo
  const replyToEmail =
    typeof replyToOverride === 'string'
      ? replyToOverride.trim()
      : replyToOverride?.email?.trim() || defaultReplyTo
  const replyToName = typeof replyToOverride === 'object' ? replyToOverride?.name?.trim() : undefined
  const shouldIncludeReplyTo = input.includeReplyTo !== false && Boolean(replyToEmail)

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: from,
      to: [{ email: input.to.trim() }],
      ...(shouldIncludeReplyTo && replyToEmail
        ? {
            replyTo: {
              email: replyToEmail,
              ...(replyToName ? { name: replyToName } : {}),
            },
          }
        : {}),
      subject: input.subject,
      htmlContent: input.html,
      ...(input.text ? { textContent: input.text } : {}),
    }),
  })

  if (!response.ok) {
    let message = `Brevo a refusé l'envoi (${response.status}).`

    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) {
        message = body.message
      }
    } catch {
      // ignore parse error
    }

    throw new SendEmailError(message, response.status)
  }

  try {
    const body = (await response.json()) as { messageId?: string }
    return { messageId: body.messageId }
  } catch {
    return {}
  }
}
