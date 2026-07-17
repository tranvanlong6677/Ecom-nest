import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { OrderStatus, Prisma } from '@/generated/prisma/client'
import { CreateOrderBodyType, GetOrderListQueryType, GetOrderListResType } from './order.model'
import { OrderException } from './order.error'

@Injectable()
export class OrderRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list(userId: number, query: GetOrderListQueryType): Promise<GetOrderListResType> {
    const { page, limit, status } = query
    const skip = (page - 1) * limit
    const take = limit
    const where: Prisma.OrderWhereInput = { userId, status }

    const totalItems$ = this.prismaService.order.count({ where })
    const data$ = this.prismaService.order.findMany({
      where,
      include: { items: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    })

    const [data, totalItems] = await Promise.all([data$, totalItems$])

    return {
      data: data as GetOrderListResType['data'],
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  async createOrder({ userId, data }: { userId: number; data: CreateOrderBodyType }) {
    // Giỏ hàng có thể chứa sản phẩm của nhiều shop, gom hết cartItemId lại để truy vấn 1 lần
    const allBodyCartItemIds = data.map((item) => item.cartItemIds).flat()

    const cartItems = await this.prismaService.cartItem.findMany({
      where: {
        id: { in: allBodyCartItemIds },
        userId,
      },
      include: {
        sku: {
          include: {
            product: {
              include: {
                productTranslations: true,
              },
            },
          },
        },
      },
    })

    // Bước 1: kiểm tra mọi cartItemId gửi lên đều tồn tại và thuộc về user này
    if (cartItems.length !== allBodyCartItemIds.length) {
      throw OrderException.NotFoundCartItem
    }

    // Bước 2: kiểm tra số lượng mua không vượt tồn kho
    const isOutOfStock = cartItems.some((item) => item.sku.stock < item.quantity)
    if (isOutOfStock) {
      throw OrderException.OutOfStockSKU
    }

    // Bước 3: kiểm tra sản phẩm chưa bị xóa, đã publish và không publish ở tương lai
    const isProductNotAvailable = cartItems.some((item) => {
      const product = item.sku.product
      return product.deletedAt !== null || product.publishedAt === null || product.publishedAt > new Date()
    })
    if (isProductNotAvailable) {
      throw OrderException.ProductNotFound
    }

    // Bước 4: không tin shopId client gửi lên, tự kiểm tra từng cartItem có thuộc đúng shop
    const cartItemMap = new Map<number, (typeof cartItems)[number]>()
    cartItems.forEach((item) => cartItemMap.set(item.id, item))

    const isValidShop = data.every((orderItem) =>
      orderItem.cartItemIds.every((cartItemId) => {
        // Chắc chắn tồn tại vì đã kiểm tra ở bước 1
        const cartItem = cartItemMap.get(cartItemId)!
        return cartItem.sku.createdById === orderItem.shopId
      }),
    )
    if (!isValidShop) {
      throw OrderException.SKUNotBelongToShop
    }

    // Bước 5: tạo order (kèm snapshot sản phẩm/SKU) và xóa cartItem trong 1 transaction
    const orders = await this.prismaService.$transaction(async (tx) => {
      const createdOrders = await Promise.all(
        data.map((orderItem) =>
          tx.order.create({
            data: {
              userId,
              shopId: orderItem.shopId,
              receiver: orderItem.receiver,
              status: OrderStatus.PENDING_PAYMENT,
              items: {
                create: orderItem.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)!
                  const product = cartItem.sku.product
                  return {
                    skuId: cartItem.sku.id,
                    productId: product.id,
                    productName: product.name,
                    skuValue: cartItem.sku.value,
                    skuPrice: cartItem.sku.price,
                    image: cartItem.sku.image,
                    quantity: cartItem.quantity,
                    productTranslations: product.productTranslations.map((translation) => ({
                      id: translation.id,
                      name: translation.name,
                      description: translation.description,
                      languageId: translation.languageId,
                    })),
                  }
                }),
              },
            },
            include: { items: true },
          }),
        ),
      )

      await tx.cartItem.deleteMany({
        where: { id: { in: allBodyCartItemIds } },
      })

      return createdOrders
    })

    return { data: orders }
  }
}
