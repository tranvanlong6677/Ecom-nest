import { CategoryTranslationSchema } from '@/shared/models/category-translation.model'
import { z } from 'zod'

export const CategorySchema = z.object({
  id: z.number(),
  parentCategoryId: z.number().nullable(),
  name: z.string().min(1, 'Name is required').max(500, 'Name must be at most 500 characters long'),
  logo: z.string().max(1000, 'Logo must be at most 1000 characters long').nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type CategoryType = z.infer<typeof CategorySchema>

export const CategoryIncludeTranslationSchema = CategorySchema.extend({
  categoryTranslations: z.array(CategoryTranslationSchema),
})

export type CategoryIncludeTranslationType = z.infer<typeof CategoryIncludeTranslationSchema>
