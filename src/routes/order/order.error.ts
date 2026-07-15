import { BadRequestException, NotFoundException } from '@nestjs/common'

export const OrderException = {
  NotFound: new NotFoundException([{ path: 'orderId', code: 'ERROR.ORDER_NOT_FOUND', message: 'Order is not exist' }]),
  ProductNotFound: new NotFoundException([
    { path: 'productId', code: 'ERROR.ORDER_PRODUCT_NOT_FOUND', message: 'Product is not exist' },
  ]),
  OutOfStockSKU: new BadRequestException([
    { path: 'skuId', code: 'ERROR.ORDER_SKU_OUT_OF_STOCK', message: 'SKU is out of stock' },
  ]),
  NotFoundCartItem: new NotFoundException([
    { path: 'cartItemIds', code: 'ERROR.ORDER_CART_ITEM_NOT_FOUND', message: 'Cart item is not exist' },
  ]),
  SKUNotBelongToShop: new BadRequestException([
    { path: 'cartItemIds', code: 'ERROR.ORDER_SKU_NOT_BELONG_TO_SHOP', message: 'SKU does not belong to this shop' },
  ]),
}
