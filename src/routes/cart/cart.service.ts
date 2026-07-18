import { Injectable } from '@nestjs/common'
import { CartRepo } from './cart.repo'
import { I18nContext } from 'nestjs-i18n'
import { PaginationParamsDto } from '@/shared/dtos/request.dto'
import { AddCartBodyType, DeleteCartBodyType, UpdateCartBodyType } from './cart.model'
@Injectable()
export class CartService {
  constructor(private readonly cartRepo: CartRepo) {}

  async getCart(userId: number, query: PaginationParamsDto) {
    try {
      return await this.cartRepo.list2({
        userId,
        languageId: I18nContext.current()?.lang as string,
        page: query.page,
        limit: query.limit,
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  addToCart(userId: number, body: AddCartBodyType) {
    return this.cartRepo.create({ data: body, userId, languageId: I18nContext.current()?.lang as string })
  }

  updateCartItem({ userId, cartItemId, body }: { userId: number; cartItemId: number; body: UpdateCartBodyType }) {
    return this.cartRepo.update({
      data: body,
      cartItemId,
      userId,
      languageId: I18nContext.current()?.lang as string,
    })
  }

  async deleteCart(userId: number, body: DeleteCartBodyType) {
    const { count } = await this.cartRepo.delete({ userId, cartItemIds: body.cartItemIds })
    return {
      message: `${count} item(s) deleted from cart`,
    }
  }
}
