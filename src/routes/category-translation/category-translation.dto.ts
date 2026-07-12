import { createZodDto } from 'nestjs-zod'
import { CategoryTranslationSchema } from '@/shared/models/category-translation.model'
import {
  CreateCategoryTranslationBodySchema,
  DeleteCategoryTranslationQuerySchema,
  GetCategoryTranslationParamsSchema,
  UpdateCategoryTranslationBodySchema,
} from './category-translation.model'

export class GetCategoryTranslationParamsDTO extends createZodDto(GetCategoryTranslationParamsSchema) {}

export class DeleteCategoryTranslationQueryDTO extends createZodDto(DeleteCategoryTranslationQuerySchema) {}

export class CreateCategoryTranslationBodyDTO extends createZodDto(CreateCategoryTranslationBodySchema) {}

export class UpdateCategoryTranslationBodyDTO extends createZodDto(UpdateCategoryTranslationBodySchema) {}

export class CategoryTranslationResDTO extends createZodDto(CategoryTranslationSchema) {}
