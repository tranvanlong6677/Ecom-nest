import { createZodDto } from 'nestjs-zod'
import {
  AddCartBodySchema,
  AddCartResSchema,
  CartItemDetailSchema,
  CartItemSchema,
  DeleteCartBodySchema,
  GetCartItemParamsSchema,
  GetCartResSchema,
  UpdateCartBodySchema,
  UpdateCartResSchema,
} from './cart.model'

export class AddCartBodyDTO extends createZodDto(AddCartBodySchema) {}
export class CartItemDTO extends createZodDto(CartItemSchema) {}
export class CartItemDetailDTO extends createZodDto(CartItemDetailSchema) {}
export class GetCartResDTO extends createZodDto(GetCartResSchema) {}
export class DeleteCartBodyDTO extends createZodDto(DeleteCartBodySchema) {}
export class GetCartItemParamsDTO extends createZodDto(GetCartItemParamsSchema) {}
export class UpdateCartBodyDTO extends createZodDto(UpdateCartBodySchema) {}
export class AddCartResDTO extends createZodDto(AddCartResSchema) {}
export class UpdateCartResDTO extends createZodDto(UpdateCartResSchema) {}
