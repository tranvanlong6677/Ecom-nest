import { Injectable } from '@nestjs/common'
import { CartRepo } from './cart.repo'
import { I18nContext } from 'nestjs-i18n'
import { PaginationParamsDto } from '@/shared/dtos/request.dto'
import { AddCartBodyType, DeleteCartBodyType, UpdateCartBodyType } from './cart.model'
@Injectable()
export class CartService {
  constructor(private readonly cartRepo: CartRepo) {}

  async getCart(userId: number, query: PaginationParamsDto) {
    return this.cartRepo.list({
      userId,
      languageId: I18nContext.current()?.lang as string,
      page: query.page,
      limit: query.limit,
    })
  }

  addToCart(userId: number, body: AddCartBodyType) {
    return this.cartRepo.create({ data: body, userId })
  }

  updateCartItem(cartItemId: number, body: UpdateCartBodyType, userId: number) {
    return this.cartRepo.update({ data: body, cartItemId, userId })
  }

  async deleteCart(userId: number, body: DeleteCartBodyType) {
    const { count } = await this.cartRepo.delete({ userId, cartItemIds: body.cartItemIds })
    return {
      message: `${count} item(s) deleted from cart`,
    }
  }
}
