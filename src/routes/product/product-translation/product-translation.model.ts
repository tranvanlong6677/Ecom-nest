import { z } from 'zod'

export const ProductTranslationSchema = z.object({
  id: z.number(),
  productId: z.number(),
  name: z.string().trim().min(1, 'Name is required').max(500, 'Name must be at most 500 characters long'),
  description: z.string(),
  languageId: z.string(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type ProductTranslationType = z.infer<typeof ProductTranslationSchema>

export const GetProductTranslationParamsSchema = z
  .object({
    productTranslationId: z.coerce.number().int().positive(),
  })
  .strict()

export const DeleteProductTranslationQuerySchema = z
  .object({
    hardDelete: z.coerce.boolean().optional().default(false),
  })
  .strict()

export const CreateProductTranslationBodySchema = ProductTranslationSchema.pick({
  productId: true,
  name: true,
  description: true,
  languageId: true,
}).strict()

export const UpdateProductTranslationBodySchema = ProductTranslationSchema.pick({
  name: true,
  description: true,
}).strict()

export type GetProductTranslationParamsType = z.infer<typeof GetProductTranslationParamsSchema>
export type DeleteProductTranslationQueryType = z.infer<typeof DeleteProductTranslationQuerySchema>
export type CreateProductTranslationBodyType = z.infer<typeof CreateProductTranslationBodySchema>
export type UpdateProductTranslationBodyType = z.infer<typeof UpdateProductTranslationBodySchema>
