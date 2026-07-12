import { CategoryTranslationSchema } from '@/shared/models/category-translation.model'
import { z } from 'zod'

export const GetCategoryTranslationParamsSchema = z
  .object({
    categoryTranslationId: z.coerce.number().int().positive(),
  })
  .strict()

export const DeleteCategoryTranslationQuerySchema = z
  .object({
    hardDelete: z.coerce.boolean().optional().default(false),
  })
  .strict()

export const CreateCategoryTranslationBodySchema = CategoryTranslationSchema.pick({
  categoryId: true,
  languageId: true,
  name: true,
  description: true,
}).strict()

export const UpdateCategoryTranslationBodySchema = CategoryTranslationSchema.pick({
  name: true,
  description: true,
}).strict()

export type GetCategoryTranslationParamsType = z.infer<typeof GetCategoryTranslationParamsSchema>
export type DeleteCategoryTranslationQueryType = z.infer<typeof DeleteCategoryTranslationQuerySchema>
export type CreateCategoryTranslationBodyType = z.infer<typeof CreateCategoryTranslationBodySchema>
export type UpdateCategoryTranslationBodyType = z.infer<typeof UpdateCategoryTranslationBodySchema>
