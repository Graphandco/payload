/**
 * Schéma Zod du corps POST /api/orders (coordonnées client, créneau, lignes panier).
 */
import { z } from 'zod'

export const createOrderLineSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1),
})

export const createOrderRequestSchema = z.object({
  siteId: z.number().int().positive(),
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  pickupSlot: z.string().trim().min(1),
  lines: z.array(createOrderLineSchema).min(1),
})

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>
