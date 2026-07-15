import {
  CreateProductTranslationBodySchema,
  DeleteProductTranslationQuerySchema,
  GetProductTranslationParamsSchema,
  ProductTranslationSchema,
  UpdateProductTranslationBodySchema,
} from '@/shared/models/product-translation.model'
import { createZodDto } from 'nestjs-zod'

export class GetProductTranslationParamsDTO extends createZodDto(GetProductTranslationParamsSchema) {}

export class DeleteProductTranslationQueryDTO extends createZodDto(DeleteProductTranslationQuerySchema) {}

export class CreateProductTranslationBodyDTO extends createZodDto(CreateProductTranslationBodySchema) {}

export class UpdateProductTranslationBodyDTO extends createZodDto(UpdateProductTranslationBodySchema) {}

export class ProductTranslationResDTO extends createZodDto(ProductTranslationSchema) {}
