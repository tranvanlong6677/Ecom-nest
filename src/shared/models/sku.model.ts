import { z } from 'zod'

export const SKUSchema = z.object({
  id: z.number(),
  value: z.string().min(1, 'Value is required').max(500, 'Value must be at most 500 characters long'),
  price: z.number().positive('Price must be a positive number'),
  stock: z.number().int().positive('Stock must be a positive integer'),
  image: z.string().min(1, 'Image is required'),
  productId: z.number(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type SKUType = z.infer<typeof SKUSchema>

export const UpsertSKUBodySchema = SKUSchema.pick({
  value: true,
  price: true,
  stock: true,
  image: true,
})

export type UpsertSKUBodyType = z.infer<typeof UpsertSKUBodySchema>
