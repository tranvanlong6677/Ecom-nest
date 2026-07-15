import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { CartException } from '@/shared/models/error.model'
import { ALL_LANGUAGE_CODE } from '@/shared/constants/other.constants'
import { AddCartBodyType, CartItemDetailType, GetCartResType, UpdateCartBodyType } from './cart.model'
import { Prisma } from '@/generated/prisma/client'

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
    const data = await this.prismaService.cartItem.findMany({
      where: {
        userId,
        sku: {
          product: {
            deletedAt: null,
            publishedAt: { lte: new Date(), not: null },
          },
        },
      },
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
      include: {
        sku: {
          include: {
            product: {
              include: {
                createdBy: true,
                productTranslations: {
                  where: { languageId: languageId === ALL_LANGUAGE_CODE ? undefined : languageId, deletedAt: null },
                },
              },
            },
          },
        },
      },
    })

    const groupMap = new Map<number, CartItemDetailType>()
    for (const cartItem of data) {
      const shopId = cartItem.sku.product.createdById
      if (shopId) {
        if (!groupMap.has(shopId)) {
          groupMap.set(shopId, { shop: cartItem.sku.product.createdBy, cartItems: [] })
        }
        groupMap.get(shopId)?.cartItems.push(cartItem)
      }
    }
    const sortedGroups = Array.from(groupMap.values())
    const totalGroups = sortedGroups.length
    const pagedGroups = sortedGroups.slice(skip, skip + take)
    const totalPages = Math.ceil(totalGroups / limit)
    return { data: pagedGroups, totalItems: totalGroups, limit, page, totalPages }
  }

  async list2({
    userId,
    languageId,
    page,
    limit,
  }: {
    userId: number
    languageId: string
    limit: number
    page: number
  }): Promise<GetCartResType> {
    const skip = (page - 1) * limit
    const take = limit
    // Đếm tổng số nhóm sản phẩm
    const totalItems$ = this.prismaService.$queryRaw<{ createdById: number }[]>`
      SELECT
        "Product"."createdById"
      FROM "CartItem"
      JOIN "SKU" ON "CartItem"."skuId" = "SKU"."id"
      JOIN "Product" ON "SKU"."productId" = "Product"."id"
      WHERE "CartItem"."userId" = ${userId}
        AND "Product"."deletedAt" IS NULL
        AND "Product"."publishedAt" IS NOT NULL
        AND "Product"."publishedAt" <= NOW()
      GROUP BY "Product"."createdById"
    `
    const data$ = this.prismaService.$queryRaw<CartItemDetailType[]>`
     SELECT
       "Product"."createdById",
       json_agg(
         jsonb_build_object(
           'id', "CartItem"."id",
           'quantity', "CartItem"."quantity",
           'skuId', "CartItem"."skuId",
           'userId', "CartItem"."userId",
           'createdAt', "CartItem"."createdAt",
           'updatedAt', "CartItem"."updatedAt",
           'sku', jsonb_build_object(
             'id', "SKU"."id",
              'value', "SKU"."value",
              'price', "SKU"."price",
              'stock', "SKU"."stock",
              'image', "SKU"."image",
              'productId', "SKU"."productId",
              'product', jsonb_build_object(
                'id', "Product"."id",
                'publishedAt', "Product"."publishedAt",
                'name', "Product"."name",
                'basePrice', "Product"."basePrice",
                'virtualPrice', "Product"."virtualPrice",
                'brandId', "Product"."brandId",
                'images', "Product"."images",
                'variants', "Product"."variants",
                'productTranslations', COALESCE((
                  SELECT json_agg(
                    jsonb_build_object(
                      'id', pt."id",
                      'productId', pt."productId",
                      'languageId', pt."languageId",
                      'name', pt."name",
                      'description', pt."description"
                    )
                  ) FILTER (WHERE pt."id" IS NOT NULL)
                  FROM "ProductTranslation" pt
                  WHERE pt."productId" = "Product"."id"
                    AND pt."deletedAt" IS NULL
                    ${languageId === ALL_LANGUAGE_CODE ? Prisma.sql`` : Prisma.sql`AND pt."languageId" = ${languageId}`}
                ), '[]'::json)
              )
           )
         )
       ) AS "cartItems",
       jsonb_build_object(
         'id', "User"."id",
         'name', "User"."name",
         'avatar', "User"."avatar"
       ) AS "shop"
     FROM "CartItem"
     JOIN "SKU" ON "CartItem"."skuId" = "SKU"."id"
     JOIN "Product" ON "SKU"."productId" = "Product"."id"
     LEFT JOIN "ProductTranslation" ON "Product"."id" = "ProductTranslation"."productId"
       AND "ProductTranslation"."deletedAt" IS NULL
       ${languageId === ALL_LANGUAGE_CODE ? Prisma.sql`` : Prisma.sql`AND "ProductTranslation"."languageId" = ${languageId}`}
     LEFT JOIN "User" ON "Product"."createdById" = "User"."id"
     WHERE "CartItem"."userId" = ${userId}
        AND "Product"."deletedAt" IS NULL
        AND "Product"."publishedAt" IS NOT NULL
        AND "Product"."publishedAt" <= NOW()
     GROUP BY "Product"."createdById", "User"."id"
     ORDER BY MAX("CartItem"."updatedAt") DESC
      LIMIT ${take} 
      OFFSET ${skip}
   `
    const [data, totalItems] = await Promise.all([data$, totalItems$])
    return {
      data,
      page,
      limit,
      totalItems: totalItems.length,
      totalPages: Math.ceil(totalItems.length / limit),
    }
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
