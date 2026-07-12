import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { CreateCategoryTranslationBodyType, UpdateCategoryTranslationBodyType } from './category-translation.model'
import { CategoryTranslationType } from '@/shared/models/category-translation.model'

@Injectable()
export class CategoryTranslationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findById(id: number): Promise<CategoryTranslationType | null> {
    return this.prismaService.categoryTranslation.findFirst({
      where: { id, deletedAt: null },
    })
  }

  findByCategoryAndLanguage(categoryId: number, languageId: string): Promise<CategoryTranslationType | null> {
    return this.prismaService.categoryTranslation.findFirst({
      where: { categoryId, languageId, deletedAt: null },
    })
  }

  create(data: CreateCategoryTranslationBodyType, createdById: number): Promise<CategoryTranslationType> {
    return this.prismaService.categoryTranslation.create({
      data: { ...data, createdById },
    })
  }

  update(
    id: number,
    data: UpdateCategoryTranslationBodyType,
    updatedById: number,
  ): Promise<CategoryTranslationType> {
    return this.prismaService.categoryTranslation.update({
      where: { id, deletedAt: null },
      data: { ...data, updatedById },
    })
  }

  delete(id: number, deletedById: number, isHard = false): Promise<CategoryTranslationType> {
    if (isHard) {
      return this.prismaService.categoryTranslation.delete({
        where: { id },
      })
    }
    return this.prismaService.categoryTranslation.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById },
    })
  }
}
