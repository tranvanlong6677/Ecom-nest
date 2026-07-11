import { z } from 'zod'

export const BrandSchema = z.object({
  id: z.number(),
  logo: z.string().min(1, 'Logo is required').max(1000, 'Logo must be at most 1000 characters long'),
  name: z.string().min(1, 'Name is required').max(500, 'Name must be at most 500 characters long'),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type BrandType = z.infer<typeof BrandSchema>
