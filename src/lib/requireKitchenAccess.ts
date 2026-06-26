/**
 * Contrôle d'accès écran cuisine (à brancher sur payload.auth + scope site).
 * Retourne ok: true en attendant l'étape sécurisation.
 */
export type KitchenAccessResult =
  | { ok: true }
  | { ok: false; status: 401 | 403; message: string }

export async function requireKitchenAccess(_siteId: number): Promise<KitchenAccessResult> {
  return { ok: true }
}
