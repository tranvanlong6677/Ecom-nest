import { createZodDto } from 'nestjs-zod'
import {
  CategoryWithTranslationsSchema,
  CreateCategoryBodySchema,
  DeleteCategoryQuerySchema,
  GetCategoriesQuerySchema,
  GetCategoriesResSchema,
  GetCategoryParamsSchema,
  GetCategoryTreeResSchema,
  UpdateCategoryBodySchema,
} from './category.model'

export class GetCategoriesResDTO extends createZodDto(GetCategoriesResSchema) {}

export class GetCategoryTreeResDTO extends createZodDto(GetCategoryTreeResSchema) {}

export class GetCategoriesQueryDTO extends createZodDto(GetCategoriesQuerySchema) {}

export class GetCategoryParamsDTO extends createZodDto(GetCategoryParamsSchema) {}

export class DeleteCategoryQueryDTO extends createZodDto(DeleteCategoryQuerySchema) {}

export class CreateCategoryBodyDTO extends createZodDto(CreateCategoryBodySchema) {}

export class UpdateCategoryBodyDTO extends createZodDto(UpdateCategoryBodySchema) {}

export class CategoryResDTO extends createZodDto(CategoryWithTranslationsSchema) {}
