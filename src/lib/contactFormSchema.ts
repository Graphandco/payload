/**
 * Schéma Zod du formulaire contact (nom, email, message).
 */
import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(120, 'Nom trop long'),
  email: z.string().trim().email('Email invalide').max(254, 'Email trop long'),
  message: z
    .string()
    .trim()
    .min(1, 'Le message est requis')
    .max(5000, 'Message trop long (5000 caractères maximum)'),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>

/** Corps API : champs du formulaire + honeypot anti-spam (doit rester vide). */
export const contactFormApiSchema = contactFormSchema.extend({
  website: z.string().max(200).optional(),
})
