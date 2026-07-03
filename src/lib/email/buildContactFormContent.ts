import type { ContactFormValues } from '@/lib/contactFormSchema'
import { escapeHtml } from '@/lib/email/escapeHtml'

export type ContactFormEmailContent = {
  subject: string
  html: string
  text: string
}

export function buildContactFormContent(
  siteName: string,
  values: ContactFormValues,
): ContactFormEmailContent {
  const subject = `[Contact] Nouveau message — ${siteName}`
  const name = values.name.trim()
  const email = values.email.trim()
  const message = values.message.trim()

  const html = `
    <p>Vous avez reçu un message via le formulaire de contact de <strong>${escapeHtml(siteName)}</strong>.</p>
    <ul>
      <li><strong>Nom :</strong> ${escapeHtml(name)}</li>
      <li><strong>Email :</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></li>
    </ul>
    <p><strong>Message :</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
  `.trim()

  const text = [
    `Nouveau message via le formulaire de contact — ${siteName}`,
    '',
    `Nom : ${name}`,
    `Email : ${email}`,
    '',
    'Message :',
    message,
  ].join('\n')

  return { subject, html, text }
}
