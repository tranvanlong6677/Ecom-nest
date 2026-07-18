import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { CartException } from '@/shared/models/error.model'
import { isNotFoundPrismaError } from '@/shared/helper'
import { ALL_LANGUAGE_CODE } from '@/shared/constants/other.constants'
import {
  AddCartBodyType,
  CartItemDetailType,
  CartItemWithSKUType,
  GetCartResType,
  UpdateCartBodyType,
} from './cart.model'
import { Prisma } from '@/generated/prisma/client'

// jsonb_build_object trả timestamp dưới dạng ISO string, không phải Date như Prisma ORM,
// nên cần khai báo riêng kiểu thô rồi convert lại đúng CartItemDetailType trước khi trả về.
type RawCartItemDetail = Omit<CartItemDetailType, 'cartItems'> & {
  cartItems: (Omit<CartItemDetailType['cartItems'][number], 'createdAt' | 'updatedAt' | 'sku'> & {
    createdAt: string
    updatedAt: string
    sku: Omit<CartItemDetailType['cartItems'][number]['sku'], 'product'> & {
      product: Omit<CartItemDetailType['cartItems'][number]['sku']['product'], 'publishedAt'> & {
        publishedAt: string | null
      }
    }
  })[]
}

@Injectable()
export class CartRepo {
  constructor(private readonly prismaService: PrismaService) { }

  private validateSKU = async ({
    skuId,
    quantity = 1,
    userId,
    isCreate,
  }: {
    skuId: number
    quantity: number
    userId: number
    isCreate: boolean
  }) => {
    const [cartItem, sku] = await Promise.all([
      this.prismaService.cartItem.findUnique({
        where: { userId_skuId: { userId, skuId } },
      }),
      this.prismaService.sKU.findUnique({
        where: {
          id: skuId,
          deletedAt: null,
        },
        include: {
          product: true,
        },
      }),
    ])
    if (!sku) {
      throw CartException.NotFoundSKU
    }
    if (sku.stock < quantity) {
      throw CartException.OutOfStockSKU
    }
    // Thêm mới cộng dồn với số lượng đã có sẵn trong giỏ để không vượt tồn kho
    if (isCreate && cartItem && quantity + cartItem.quantity > sku.stock) {
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

  private findCartItemWithSKU({
    cartItemId,
    languageId,
  }: {
    cartItemId: number
    languageId: string
  }): Promise<CartItemWithSKUType> {
    return this.prismaService.cartItem.findUniqueOrThrow({
      where: { id: cartItemId },
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
    })
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
    const data$ = this.prismaService.$queryRaw<RawCartItemDetail[]>`
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
    const [rawData, totalItems] = await Promise.all([data$, totalItems$])

    const data: CartItemDetailType[] = rawData.map((group) => ({
      ...group,
      cartItems: group.cartItems.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        sku: {
          ...item.sku,
          product: {
            ...item.sku.product,
            publishedAt: item.sku.product.publishedAt ? new Date(item.sku.product.publishedAt) : null,
          },
        },
      })),
    }))

    return {
      data,
      page,
      limit,
      totalItems: totalItems.length,
      totalPages: Math.ceil(totalItems.length / limit),
    }
  }

  async create({
    data,
    userId,
    languageId,
  }: {
    data: AddCartBodyType
    userId: number
    languageId: string
  }): Promise<CartItemWithSKUType> {
    await this.validateSKU({ skuId: data.skuId, quantity: data.quantity, userId, isCreate: true })
    const cartItem = await this.prismaService.cartItem.upsert({
      where: {
        userId_skuId: {
          userId,
          skuId: data.skuId,
        },
      },
      update: {
        quantity: { increment: data.quantity },
        updatedAt: new Date(),
      },
      create: {
        ...data,
        userId,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    })
    return this.findCartItemWithSKU({ cartItemId: cartItem.id, languageId })
  }

  async update({
    data,
    cartItemId,
    userId,
    languageId,
  }: {
    data: UpdateCartBodyType
    cartItemId: number
    userId: number
    languageId: string
  }): Promise<CartItemWithSKUType> {
    await this.validateSKU({ skuId: data.skuId, quantity: data.quantity, userId, isCreate: false })
    const updated = await this.prismaService.cartItem
      .update({
        where: {
          id: cartItemId,
          userId,
        },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      })
      .catch((error) => {
        if (isNotFoundPrismaError(error)) {
          throw CartException.NotFoundCartItem
        }
        throw error
      })
    return this.findCartItemWithSKU({ cartItemId: updated.id, languageId })
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
