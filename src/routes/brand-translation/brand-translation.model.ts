import { BrandTranslationSchema } from '@/shared/models/brand-translation.model'
import { z } from 'zod'

export const GetBrandTranslationParamsSchema = z
  .object({
    brandTranslationId: z.coerce.number().int().positive(),
  })
  .strict()

export const DeleteBrandTranslationQuerySchema = z
  .object({
    hardDelete: z.coerce.boolean().optional().default(false),
  })
  .strict()

export const CreateBrandTranslationBodySchema = BrandTranslationSchema.pick({
  brandId: true,
  languageId: true,
  name: true,
  description: true,
}).strict()

export const UpdateBrandTranslationBodySchema = BrandTranslationSchema.pick({
  name: true,
  description: true,
}).strict()

export type GetBrandTranslationParamsType = z.infer<typeof GetBrandTranslationParamsSchema>
export type DeleteBrandTranslationQueryType = z.infer<typeof DeleteBrandTranslationQuerySchema>
export type CreateBrandTranslationBodyType = z.infer<typeof CreateBrandTranslationBodySchema>
export type UpdateBrandTranslationBodyType = z.infer<typeof UpdateBrandTranslationBodySchema>
