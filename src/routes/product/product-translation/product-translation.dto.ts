import { createZodDto } from 'nestjs-zod'
import {
  CreateProductTranslationBodySchema,
  DeleteProductTranslationQuerySchema,
  GetProductTranslationParamsSchema,
  ProductTranslationSchema,
  UpdateProductTranslationBodySchema,
} from './product-translation.model'

export class GetProductTranslationParamsDTO extends createZodDto(GetProductTranslationParamsSchema) {}

export class DeleteProductTranslationQueryDTO extends createZodDto(DeleteProductTranslationQuerySchema) {}

export class CreateProductTranslationBodyDTO extends createZodDto(CreateProductTranslationBodySchema) {}

export class UpdateProductTranslationBodyDTO extends createZodDto(UpdateProductTranslationBodySchema) {}

export class ProductTranslationResDTO extends createZodDto(ProductTranslationSchema) {}
