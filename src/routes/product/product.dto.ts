import { createZodDto } from 'nestjs-zod'
import {
  CreateProductBodySchema,
  DeleteProductQuerySchema,
  GetProductDetailResSchema,
  GetProductParamsSchema,
  GetProductsQuerySchema,
  GetProductsResSchema,
  UpdateProductBodySchema,
} from './product.model'

export class GetProductsQueryDTO extends createZodDto(GetProductsQuerySchema) {}

export class GetProductsResDTO extends createZodDto(GetProductsResSchema) {}

export class GetProductParamsDTO extends createZodDto(GetProductParamsSchema) {}

export class GetProductDetailResDTO extends createZodDto(GetProductDetailResSchema) {}

export class DeleteProductQueryDTO extends createZodDto(DeleteProductQuerySchema) {}

export class CreateProductBodyDTO extends createZodDto(CreateProductBodySchema) {}

export class UpdateProductBodyDTO extends createZodDto(UpdateProductBodySchema) {}
