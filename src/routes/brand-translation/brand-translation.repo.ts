import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { CreateBrandTranslationBodyType, UpdateBrandTranslationBodyType } from './brand-translation.model'
import { BrandTranslationType } from '@/shared/models/brand-translation.model'

@Injectable()
export class BrandTranslationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findById(id: number): Promise<BrandTranslationType | null> {
    return this.prismaService.brandTranslation.findFirst({
      where: { id, deletedAt: null },
    })
  }

  findByBrandAndLanguage(brandId: number, languageId: string): Promise<BrandTranslationType | null> {
    return this.prismaService.brandTranslation.findFirst({
      where: { brandId, languageId, deletedAt: null },
    })
  }

  create(data: CreateBrandTranslationBodyType, createdById: number): Promise<BrandTranslationType> {
    return this.prismaService.brandTranslation.create({
      data: { ...data, createdById },
    })
  }

  update(
    id: number,
    data: UpdateBrandTranslationBodyType,
    updatedById: number,
  ): Promise<BrandTranslationType> {
    return this.prismaService.brandTranslation.update({
      where: { id, deletedAt: null },
      data: { ...data, updatedById },
    })
  }

  delete(id: number, deletedById: number, isHard = false): Promise<BrandTranslationType> {
    if (isHard) {
      return this.prismaService.brandTranslation.delete({
        where: { id },
      })
    }
    return this.prismaService.brandTranslation.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById },
    })
  }
}
