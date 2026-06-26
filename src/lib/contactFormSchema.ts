import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis'),
  email: z.string().trim().email('Email invalide'),
  message: z.string().trim().min(1, 'Le message est requis'),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
