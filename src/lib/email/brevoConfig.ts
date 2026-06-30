/**
 * Variables d'environnement Brevo (globales, un compte pour toute la plateforme).
 */
export class EmailConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EmailConfigError'
  }
}

export function getBrevoApiKey(): string {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  if (!apiKey) {
    throw new EmailConfigError('BREVO_API_KEY est manquant dans le fichier .env.')
  }

  return apiKey
}

export function getPlatformFromEmail(): string {
  const email = process.env.EMAIL_PLATFORM_FROM_ADDRESS?.trim()
  if (!email) {
    throw new EmailConfigError('EMAIL_PLATFORM_FROM_ADDRESS est manquant dans le fichier .env.')
  }

  return email
}

export function getPlatformFromName(): string | undefined {
  return process.env.EMAIL_PLATFORM_FROM_NAME?.trim() || undefined
}

export function isEmailTestRouteEnabled(): boolean {
  return Boolean(process.env.EMAIL_TEST_SECRET?.trim())
}

export function assertEmailTestSecret(provided: string | undefined): void {
  const expected = process.env.EMAIL_TEST_SECRET?.trim()
  if (!expected) {
    throw new EmailConfigError(
      'Route de test désactivée : ajoutez EMAIL_TEST_SECRET dans le fichier .env.',
    )
  }

  if (provided !== expected) {
    throw new EmailConfigError('Secret de test invalide.')
  }
}
