import { createZodDto } from 'nestjs-zod'
import {
  CreateProductTranslationBodySchema,
  DeleteProductTranslationParamsSchema,
  GetProductTranslationParamsSchema,
  ProductTranslationSchema,
  UpdateProductTranslationBodySchema,
} from './product-translation.model'

export class GetProductTranslationParamsDTO extends createZodDto(GetProductTranslationParamsSchema) {}

export class CreateProductTranslationBodyDTO extends createZodDto(CreateProductTranslationBodySchema) {}

export class UpdateProductTranslationBodyDTO extends createZodDto(UpdateProductTranslationBodySchema) {}

export class DeleteProductTranslationParamsDTO extends createZodDto(DeleteProductTranslationParamsSchema) {}

export class ProductTranslationResDTO extends createZodDto(ProductTranslationSchema) {}
