import { createZodDto } from 'nestjs-zod'
import {
  CancelOrderResSchema,
  CreateOrderBodySchema,
  CreateOrderResSchema,
  GetOrderDetailResSchema,
  GetOrderListQuerySchema,
  GetOrderListResSchema,
  GetOrderParamsSchema,
} from './order.model'

export class GetOrderListQueryDTO extends createZodDto(GetOrderListQuerySchema) {}
export class GetOrderListResDTO extends createZodDto(GetOrderListResSchema) {}
export class GetOrderParamsDTO extends createZodDto(GetOrderParamsSchema) {}
export class GetOrderDetailResDTO extends createZodDto(GetOrderDetailResSchema) {}
export class CreateOrderBodyDTO extends createZodDto(CreateOrderBodySchema) {}
export class CreateOrderResDTO extends createZodDto(CreateOrderResSchema) {}
export class CancelOrderResDTO extends createZodDto(CancelOrderResSchema) {}
