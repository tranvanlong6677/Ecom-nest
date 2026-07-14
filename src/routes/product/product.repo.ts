import { ALL_LANGUAGE_CODE, SortBy } from '@/shared/constants/other.constants'
import { Prisma } from '@/generated/prisma/client'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import {
  CreateProductBodyType,
  GetProductDetailResType,
  GetProductsQueryType,
  GetProductsResType,
  UpdateProductBodyType,
} from './product.model'
import { ProductType } from '@/shared/models/product.model'

const buildPublishedAtCondition = (isPublic?: boolean): Prisma.ProductWhereInput => {
  if (isPublic === true) {
    return { publishedAt: { lte: new Date(), not: null } }
  }
  if (isPublic === false) {
    return { OR: [{ publishedAt: null }, { publishedAt: { gt: new Date() } }] }
  }
  return {}
}

const buildOrderBy = (
  orderBy: GetProductsQueryType['orderBy'],
  sortBy: GetProductsQueryType['sortBy'],
): Prisma.ProductOrderByWithRelationInput => {
  if (sortBy === SortBy.Price) {
    return { basePrice: orderBy }
  }
  if (sortBy === SortBy.Sale) {
    return { orders: { _count: orderBy } }
  }
  return { createdAt: orderBy }
}

@Injectable()
export class ProductRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list({
    query,
    languageId,
    isPublic,
    createdById,
  }: {
    query: GetProductsQueryType
    languageId: string
    isPublic?: boolean
    createdById?: number
  }): Promise<GetProductsResType> {
    const skip = (query.page - 1) * query.limit
    const take = query.limit
    const { name, brandIds, categories, minPrice, maxPrice } = query
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...buildPublishedAtCondition(isPublic),
      ...(createdById ? { createdById } : {}),
      ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
      ...(brandIds && brandIds.length > 0 ? { brandId: { in: brandIds } } : {}),
      ...(categories && categories.length > 0 ? { categories: { some: { id: { in: categories } } } } : {}),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            basePrice: {
              ...(minPrice !== undefined ? { gte: minPrice } : {}),
              ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            },
          }
        : {}),
    }
    const [totalItems, data] = await Promise.all([
      this.prismaService.product.count({ where }),
      this.prismaService.product.findMany({
        where,
        include: {
          productTranslations: {
            where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
          },
        },
        orderBy: buildOrderBy(query.orderBy, query.sortBy),
        skip,
        take,
      }),
    ])
    return {
      data,
      totalItems,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalItems / query.limit),
    }
  }

  findById(id: number): Promise<ProductType | null> {
    return this.prismaService.product.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  getDetail({
    productId,
    languageId,
    isPublic,
  }: {
    productId: number
    languageId: string
    isPublic?: boolean
  }): Promise<GetProductDetailResType | null> {
    return this.prismaService.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        ...buildPublishedAtCondition(isPublic),
      },
      include: {
        productTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
        },
        skus: { where: { deletedAt: null } },
        brand: {
          include: {
            brandTranslations: {
              where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
            },
          },
        },
        categories: {
          where: { deletedAt: null },
          include: {
            categoryTranslations: {
              where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
            },
          },
        },
      },
    })
  }

  create({
    createdById,
    data,
  }: {
    createdById: number
    data: CreateProductBodyType
  }): Promise<GetProductDetailResType> {
    const { skus, categories, ...productData } = data
    return this.prismaService.product.create({
      data: {
        createdById,
        ...productData,
        categories: {
          connect: categories.map((category) => ({ id: category })),
        },
        skus: {
          createMany: {
            data: skus,
          },
        },
      },
      include: {
        productTranslations: { where: { deletedAt: null } },
        skus: { where: { deletedAt: null } },
        brand: {
          include: { brandTranslations: { where: { deletedAt: null } } },
        },
        categories: {
          where: { deletedAt: null },
          include: { categoryTranslations: { where: { deletedAt: null } } },
        },
      },
    })
  }

  async update({
    id,
    updatedById,
    data,
  }: {
    id: number
    updatedById: number
    data: UpdateProductBodyType
  }): Promise<ProductType> {
    const { skus: dataSkus, categories, ...productData } = data

    const existingSKUs = await this.prismaService.sKU.findMany({
      where: { productId: id, deletedAt: null },
    })

    // SKU có trong DB nhưng không có trong payload -> đã bị bỏ, cần xóa mềm
    const skusToDelete = existingSKUs.filter((sku) => dataSkus.every((dataSku) => dataSku.value !== sku.value))
    const skuIdsToDelete = skusToDelete.map((sku) => sku.id)

    // Gắn id thật (nếu có) vào từng SKU của payload dựa theo value, để phân biệt update/create
    const skusWithId = dataSkus.map((dataSku) => {
      const existingSku = existingSKUs.find((sku) => sku.value === dataSku.value)
      return { ...dataSku, id: existingSku ? existingSku.id : null }
    })

    const skusToUpdate = skusWithId.filter((sku) => sku.id !== null)
    const skusToCreate = skusWithId
      .filter((sku) => sku.id === null)
      .map((sku) => ({
        value: sku.value,
        price: sku.price,
        stock: sku.stock,
        image: sku.image,
        productId: id,
        createdById: updatedById,
      }))

    const [product] = await this.prismaService.$transaction([
      this.prismaService.product.update({
        where: { id, deletedAt: null },
        data: {
          ...productData,
          updatedById,
          categories: {
            connect: categories.map((category) => ({ id: category })),
          },
        },
      }),
      this.prismaService.sKU.updateMany({
        where: { id: { in: skuIdsToDelete } },
        data: { deletedAt: new Date(), deletedById: updatedById },
      }),
      ...skusToUpdate.map((sku) =>
        this.prismaService.sKU.update({
          where: { id: sku.id as number },
          data: {
            value: sku.value,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
            updatedById,
          },
        }),
      ),
      this.prismaService.sKU.createMany({
        data: skusToCreate,
      }),
    ])

    return product
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean): Promise<ProductType> {
    if (isHard) {
      const [product] = await Promise.all([
        this.prismaService.product.delete({ where: { id } }),
        this.prismaService.sKU.deleteMany({ where: { productId: id } }),
      ])
      return product
    }

    const now = new Date()
    const [product] = await Promise.all([
      this.prismaService.product.update({
        where: { id, deletedAt: null },
        data: { deletedAt: now, deletedById },
      }),
      this.prismaService.sKU.updateMany({
        where: { productId: id, deletedAt: null },
        data: { deletedAt: now, deletedById },
      }),
    ])
    return product
  }
}
