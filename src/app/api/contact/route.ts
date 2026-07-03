/**
 * POST /api/contact — envoi du formulaire contact vers l'e-mail du restaurant (Brevo).
 */
import { SubmitContactFormError, submitContactForm } from '@/lib/contact/submitContactForm'

export async function POST(request: Request) {
  let json: unknown

  try {
    json = await request.json()
  } catch {
    return Response.json(
      { error: 'INVALID_JSON', message: 'JSON invalide.' },
      { status: 400 },
    )
  }

  try {
    const result = await submitContactForm(request, json)

    return Response.json({
      ok: true,
      message: 'Votre message a bien été envoyé.',
      messageId: result.messageId,
    })
  } catch (error) {
    if (error instanceof SubmitContactFormError) {
      const status =
        error.code === 'SITE_NOT_FOUND'
          ? 404
          : error.code === 'INVALID_BODY' || error.code === 'CONTACT_EMAIL_MISSING'
            ? 400
            : error.code === 'SEND_FAILED'
              ? 502
              : 500

      return Response.json({ error: error.code, message: error.message }, { status })
    }

    console.error('[POST /api/contact]', error)
    return Response.json(
      { error: 'INTERNAL_ERROR', message: 'Une erreur est survenue.' },
      { status: 500 },
    )
  }
}
