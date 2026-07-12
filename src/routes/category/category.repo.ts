import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { CategoryWithTranslationsType, CreateCategoryBodyType, UpdateCategoryBodyType } from './category.model'
import { CategoryType } from '@/shared/models/category.model'

@Injectable()
export class CategoryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(parentCategoryId?: number): Promise<{ data: CategoryWithTranslationsType[]; totalItems: number }> {
    const where = { deletedAt: null, parentCategoryId: parentCategoryId ?? null }
    const [totalItems, data] = await Promise.all([
      this.prismaService.category.count({ where }),
      this.prismaService.category.findMany({
        where,
        include: {
          categoryTranslations: { where: { deletedAt: null } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])
    return { data, totalItems }
  }

  findAllForTree(): Promise<CategoryWithTranslationsType[]> {
    return this.prismaService.category.findMany({
      where: { deletedAt: null },
      include: {
        categoryTranslations: { where: { deletedAt: null } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  findById(id: number): Promise<CategoryWithTranslationsType | null> {
    return this.prismaService.category.findFirst({
      where: { id, deletedAt: null },
      include: {
        categoryTranslations: { where: { deletedAt: null } },
      },
    })
  }

  create(data: CreateCategoryBodyType, createdById: number): Promise<CategoryWithTranslationsType> {
    return this.prismaService.category.create({
      data: { ...data, createdById },
      include: {
        categoryTranslations: { where: { deletedAt: null } },
      },
    })
  }

  update(id: number, data: UpdateCategoryBodyType, updatedById: number): Promise<CategoryWithTranslationsType> {
    return this.prismaService.category.update({
      where: { id, deletedAt: null },
      data: { ...data, updatedById },
      include: {
        categoryTranslations: { where: { deletedAt: null } },
      },
    })
  }

  delete(id: number, deletedById: number, isHard = false): Promise<CategoryType> {
    if (isHard) {
      return this.prismaService.category.delete({
        where: { id },
      })
    }
    return this.prismaService.category.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById },
    })
  }
}
