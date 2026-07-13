import {
  CategoryIncludeTranslationSchema,
  CategoryIncludeTranslationType,
  CategorySchema,
} from '@/shared/models/category.model'
import { z } from 'zod'

export const GetCategoriesResSchema = z.object({
  data: z.array(CategoryIncludeTranslationSchema),
  totalItems: z.number(),
})

export type CategoryTreeNodeType = CategoryIncludeTranslationType & {
  childrenCategories: CategoryTreeNodeType[]
}

export const CategoryTreeNodeSchema: z.ZodType<CategoryTreeNodeType> = CategoryIncludeTranslationSchema.extend({
  childrenCategories: z.lazy(() => z.array(CategoryTreeNodeSchema)),
})

export const GetCategoryTreeResSchema = z.object({
  data: z.array(CategoryTreeNodeSchema),
})

export const GetCategoriesQuerySchema = z
  .object({
    parentCategoryId: z.coerce.number().int().positive().optional(),
  })
  .strict()

export const GetCategoryParamsSchema = z
  .object({
    categoryId: z.coerce.number().int().positive(),
  })
  .strict()

export const DeleteCategoryQuerySchema = z
  .object({
    hardDelete: z.coerce.boolean().optional().default(false),
  })
  .strict()

export const CreateCategoryBodySchema = CategorySchema.pick({
  name: true,
  logo: true,
  parentCategoryId: true,
}).strict()

export const UpdateCategoryBodySchema = CategorySchema.pick({
  name: true,
  logo: true,
  parentCategoryId: true,
}).strict()

export type GetCategoryTreeResType = z.infer<typeof GetCategoryTreeResSchema>
export type GetCategoriesResType = z.infer<typeof GetCategoriesResSchema>
export type GetCategoriesQueryType = z.infer<typeof GetCategoriesQuerySchema>
export type GetCategoryParamsType = z.infer<typeof GetCategoryParamsSchema>
export type DeleteCategoryQueryType = z.infer<typeof DeleteCategoryQuerySchema>
export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>
