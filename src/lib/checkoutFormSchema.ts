import { z } from 'zod'

export const checkoutFormSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis'),
  email: z.string().trim().email('Email invalide'),
  phone: z.string().trim().min(1, 'Le téléphone est requis'),
  pickupSlot: z.string().trim().min(1, 'Choisissez un créneau de retrait'),
})

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>
