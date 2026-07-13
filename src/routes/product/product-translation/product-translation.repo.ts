import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import {
  CreateProductTranslationBodyType,
  ProductTranslationType,
  UpdateProductTranslationBodyType,
} from './product-translation.model'

@Injectable()
export class ProductTranslationRepo {
  constructor(private readonly prismaService: PrismaService) {}

  findById(id: number): Promise<ProductTranslationType | null> {
    return this.prismaService.productTranslation.findFirst({
      where: { id, deletedAt: null },
    })
  }

  findByProductAndLanguage(productId: number, languageId: string): Promise<ProductTranslationType | null> {
    return this.prismaService.productTranslation.findFirst({
      where: { productId, languageId, deletedAt: null },
    })
  }

  create(data: CreateProductTranslationBodyType, createdById: number): Promise<ProductTranslationType> {
    return this.prismaService.productTranslation.create({
      data: { ...data, createdById },
    })
  }

  update(id: number, data: UpdateProductTranslationBodyType, updatedById: number): Promise<ProductTranslationType> {
    return this.prismaService.productTranslation.update({
      where: { id, deletedAt: null },
      data: { ...data, updatedById },
    })
  }

  delete(id: number, deletedById: number, isHard = false): Promise<ProductTranslationType> {
    if (isHard) {
      return this.prismaService.productTranslation.delete({
        where: { id },
      })
    }
    return this.prismaService.productTranslation.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById },
    })
  }
}
