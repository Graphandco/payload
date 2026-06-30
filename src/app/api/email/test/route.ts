/**
 * POST /api/email/test — envoi de test Brevo (étape 2, à retirer ou garder protégé en prod).
 *
 * Body JSON : { "siteId": 1, "to": "vous@exemple.fr", "secret": "…" }
 * Requiert EMAIL_TEST_SECRET dans le .env.
 */
import { EmailConfigError, assertEmailTestSecret, isEmailTestRouteEnabled } from '@/lib/email/brevoConfig'
import { SendEmailError, sendEmailViaBrevo } from '@/lib/email/sendEmailViaBrevo'
import { resolveEmailSender } from '@/lib/email/resolveEmailSender'
import configPromise from '@payload-config'
import type { Site } from '@/payload-types'
import { getPayload } from 'payload'
import { z } from 'zod'

const bodySchema = z.object({
  siteId: z.number().int().positive(),
  to: z.string().trim().email(),
  secret: z.string().min(1),
})

export async function POST(request: Request) {
  if (!isEmailTestRouteEnabled()) {
    return Response.json(
      {
        error: 'DISABLED',
        message:
          'Route de test désactivée. Ajoutez EMAIL_TEST_SECRET dans le .env puis redémarrez le serveur.',
      },
      { status: 404 },
    )
  }

  let json: unknown

  try {
    json = await request.json()
  } catch {
    return Response.json(
      { error: 'INVALID_JSON', message: 'JSON invalide. Vérifiez les guillemets dans le corps de la requête.' },
      { status: 400 },
    )
  }

  try {
    const parsed = bodySchema.safeParse(json)

    if (!parsed.success) {
      return Response.json(
        { error: 'INVALID_BODY', message: 'Corps invalide : siteId, to, secret requis.' },
        { status: 400 },
      )
    }

    const { siteId, to, secret } = parsed.data

    try {
      assertEmailTestSecret(secret)
    } catch (error) {
      if (error instanceof EmailConfigError) {
        return Response.json({ error: 'UNAUTHORIZED', message: error.message }, { status: 401 })
      }

      throw error
    }

    const payload = await getPayload({ config: configPromise })
    const site = (await payload.findByID({
      collection: 'sites',
      id: siteId,
      depth: 0,
      overrideAccess: true,
    })) as Site

    const sender = resolveEmailSender(site)

    const result = await sendEmailViaBrevo({
      to,
      site,
      subject: `[Test] ${site.name} — Brevo OK`,
      html: `
        <p>Ceci est un e-mail de test depuis <strong>${site.name}</strong>.</p>
        <p>Si vous le recevez, Brevo est correctement branché sur l'application.</p>
        <ul>
          <li>From : ${sender.from.name} &lt;${sender.from.email}&gt;</li>
          <li>Reply-To : ${sender.replyTo ?? '—'}</li>
        </ul>
      `.trim(),
      text: `Test Brevo pour ${site.name}. From: ${sender.from.name} <${sender.from.email}>`,
    })

    return Response.json({
      ok: true,
      message: `E-mail de test envoyé à ${to}.`,
      messageId: result.messageId,
      sender,
    })
  } catch (error) {
    if (error instanceof SendEmailError) {
      return Response.json({ error: 'SEND_FAILED', message: error.message }, { status: 502 })
    }

    console.error('[POST /api/email/test]', error)
    return Response.json({ error: 'INTERNAL_ERROR', message: 'Une erreur est survenue.' }, { status: 500 })
  }
}
