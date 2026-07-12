import { z } from 'zod'

export const CategoryTranslationSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  languageId: z.string(),
  name: z.string().min(1, 'Name is required').max(500, 'Name must be at most 500 characters long'),
  description: z.string(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type CategoryTranslationType = z.infer<typeof CategoryTranslationSchema>
