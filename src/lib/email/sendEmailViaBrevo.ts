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

  const { from, replyTo } = resolveEmailSender(input.site)
  const shouldIncludeReplyTo = input.includeReplyTo !== false && Boolean(replyTo)

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
      ...(shouldIncludeReplyTo && replyTo ? { replyTo: { email: replyTo } } : {}),
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
