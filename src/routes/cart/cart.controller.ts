import { Controller, Get, Body, Param, Delete, Query, Post, Put } from '@nestjs/common'
import { CartService } from './cart.service'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { PaginationParamsDto } from '@/shared/dtos/request.dto'
import {
  AddCartBodyDTO,
  AddCartResDTO,
  DeleteCartBodyDTO,
  GetCartResDTO,
  UpdateCartBodyDTO,
  UpdateCartResDTO,
} from './cart.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDTO } from '@/shared/dtos/response.dto'

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ZodSerializerDto(GetCartResDTO)
  findAll(@Query() query: PaginationParamsDto, @ActiveUser('userId') userId: number) {
    return this.cartService.getCart(userId, query)
  }

  @Post()
  @ZodSerializerDto(AddCartResDTO)
  create(@Body() body: AddCartBodyDTO, @ActiveUser('userId') userId: number) {
    return this.cartService.addToCart(userId, body)
  }

  @Put(':id')
  @ZodSerializerDto(UpdateCartResDTO)
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartBodyDTO, @ActiveUser('userId') userId: number) {
    return this.cartService.updateCartItem({ userId, cartItemId: +id, body: updateCartDto })
  }

  @Delete()
  @ZodSerializerDto(MessageResDTO)
  remove(@Body() body: DeleteCartBodyDTO, @ActiveUser('userId') userId: number) {
    return this.cartService.deleteCart(userId, body)
  }
}
