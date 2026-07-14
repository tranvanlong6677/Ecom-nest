import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { CartException } from '@/shared/models/error.model'
import { ALL_LANGUAGE_CODE } from '@/shared/constants/other.constants'
import { AddCartBodyType, GetCartResType, UpdateCartBodyType } from './cart.model'

@Injectable()
export class CartRepo {
  constructor(private readonly prismaService: PrismaService) {}

  private validateSKU = async ({ skuId, quantity = 1 }: { skuId: number; quantity: number }) => {
    const sku = await this.prismaService.sKU.findUnique({
      where: {
        id: skuId,
        deletedAt: null,
      },
      include: {
        product: true,
      },
    })
    if (!sku) {
      throw CartException.NotFoundSKU
    }
    if (sku.stock < quantity) {
      throw CartException.OutOfStockSKU
    }

    const product = sku.product
    if (!product) {
      throw CartException.ProductNotFound
    }

    if (
      product.deletedAt !== null ||
      product.publishedAt === null ||
      (product.publishedAt !== null && product.publishedAt > new Date())
    ) {
      throw CartException.ProductNotFound
    }

    return sku
  }

  async list({
    userId,
    page,
    limit,
    languageId,
  }: {
    userId: number
    page: number
    limit: number
    languageId: string
  }): Promise<GetCartResType> {
    const skip = (page - 1) * limit
    const take = limit
    const [data, totalItems] = await Promise.all([
      this.prismaService.cartItem.findMany({
        where: {
          userId,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          sku: {
            include: {
              product: {
                include: {
                  productTranslations: {
                    where: { languageId: languageId === ALL_LANGUAGE_CODE ? undefined : languageId, deletedAt: null },
                  },
                },
              },
            },
          },
        },
      }),
      this.prismaService.cartItem.count({ where: { userId } }),
    ])
    const totalPages = Math.ceil(totalItems / limit)
    return { data, totalItems, limit, page, totalPages }
  }

  async create({ data, userId }: { data: AddCartBodyType; userId: number }) {
    await this.validateSKU({ skuId: data.skuId, quantity: data.quantity })
    return await this.prismaService.cartItem.create({
      data: {
        ...data,
        userId,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    })
  }

  async update({ data, cartItemId, userId }: { data: UpdateCartBodyType; cartItemId: number; userId: number }) {
    const cartItem = await this.prismaService.cartItem.findUnique({
      where: { id: cartItemId },
    })
    if (!cartItem || cartItem.userId !== userId) {
      throw CartException.NotFoundCartItem
    }

    await this.validateSKU({ skuId: data.skuId, quantity: data.quantity })
    return await this.prismaService.cartItem.update({
      where: {
        id: cartItemId,
        userId,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }

  async delete({ userId, cartItemIds }: { userId: number; cartItemIds: number[] }) {
    return await this.prismaService.cartItem.deleteMany({
      where: {
        userId,
        id: {
          in: cartItemIds,
        },
      },
    })
  }
}
