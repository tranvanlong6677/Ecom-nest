import { z } from 'zod'

export const LanguageSchema = z.object({
  id: z.string().min(1, 'Id is required').max(10, 'Id must be at most 10 characters long'),
  name: z.string().min(1, 'Name is required').max(500, 'Name must be at most 500 characters long'),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type LanguageType = z.infer<typeof LanguageSchema>

export const GetLanguagesResSchema = z.object({
  data: z.array(LanguageSchema),
  totalItems: z.number(),
})

export const GetLanguageParamsSchema = z
  .object({
    languageId: LanguageSchema.shape.id,
  })
  .strict()

export const CreateLanguageBodySchema = LanguageSchema.pick({
  id: true,
  name: true,
}).strict()

export const UpdateLanguageBodySchema = LanguageSchema.pick({
  name: true,
}).strict()

export type GetLanguagesResType = z.infer<typeof GetLanguagesResSchema>
export type GetLanguageParamsType = z.infer<typeof GetLanguageParamsSchema>
export type CreateLanguageBodyType = z.infer<typeof CreateLanguageBodySchema>
export type UpdateLanguageBodyType = z.infer<typeof UpdateLanguageBodySchema>
