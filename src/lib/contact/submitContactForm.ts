import type { ContactFormValues } from '@/lib/contactFormSchema'
import { contactFormApiSchema } from '@/lib/contactFormSchema'
import { buildContactFormContent } from '@/lib/email/buildContactFormContent'
import { SendEmailError, sendEmailViaBrevo } from '@/lib/email/sendEmailViaBrevo'
import { getSiteFromRequest } from '@/lib/getSiteFromRequest'
import type { Site } from '@/payload-types'

export type SubmitContactFormErrorCode =
  | 'INVALID_BODY'
  | 'SITE_NOT_FOUND'
  | 'CONTACT_EMAIL_MISSING'
  | 'SEND_FAILED'

export class SubmitContactFormError extends Error {
  code: SubmitContactFormErrorCode

  constructor(code: SubmitContactFormErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

export type SubmitContactFormResult = {
  ok: true
  messageId?: string
  skipped?: boolean
}

export async function submitContactForm(
  request: Request,
  input: unknown,
): Promise<SubmitContactFormResult> {
  const parsed = contactFormApiSchema.safeParse(input)

  if (!parsed.success) {
    throw new SubmitContactFormError('INVALID_BODY', 'Données du formulaire invalides.')
  }

  const { website, ...values } = parsed.data

  if (website?.trim()) {
    return { ok: true, skipped: true }
  }

  const site = await getSiteFromRequest(request)

  if (!site) {
    throw new SubmitContactFormError('SITE_NOT_FOUND', 'Site introuvable.')
  }

  return sendContactFormEmail(site, values)
}

export async function sendContactFormEmail(
  site: Pick<Site, 'name' | 'contact'>,
  values: ContactFormValues,
): Promise<SubmitContactFormResult> {
  const recipient = site.contact?.email?.trim()

  if (!recipient) {
    throw new SubmitContactFormError(
      'CONTACT_EMAIL_MISSING',
      'Aucune adresse e-mail de contact configurée pour ce site.',
    )
  }

  const { subject, html, text } = buildContactFormContent(site.name, values)

  try {
    const result = await sendEmailViaBrevo({
      to: recipient,
      subject,
      html,
      text,
      site,
      replyTo: {
        email: values.email.trim(),
        name: values.name.trim(),
      },
    })

    return { ok: true, messageId: result.messageId }
  } catch (error) {
    if (error instanceof SendEmailError) {
      throw new SubmitContactFormError('SEND_FAILED', error.message)
    }

    throw error
  }
}
