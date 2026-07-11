import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { BrandWithTranslationsType, CreateBrandBodyType, GetBrandsQueryType, UpdateBrandBodyType } from './brand.model'
import { BrandType } from '@/shared/models/brand.model'

@Injectable()
export class BrandRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: GetBrandsQueryType): Promise<{ data: BrandType[]; totalItems: number }> {
    const { page, limit } = query
    const skip = (page - 1) * limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.brand.count({ where: { deletedAt: null } }),
      this.prismaService.brand.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
    ])
    return { data, totalItems }
  }

  findById(id: number): Promise<BrandWithTranslationsType | null> {
    return this.prismaService.brand.findFirst({
      where: { id, deletedAt: null },
      include: {
        brandTranslations: { where: { deletedAt: null } },
      },
    })
  }

  create(data: CreateBrandBodyType, createdById: number): Promise<BrandWithTranslationsType> {
    return this.prismaService.brand.create({
      data: { ...data, createdById },
      include: {
        brandTranslations: { where: { deletedAt: null } },
      },
    })
  }

  update(id: number, data: UpdateBrandBodyType, updatedById: number): Promise<BrandWithTranslationsType> {
    return this.prismaService.brand.update({
      where: { id, deletedAt: null },
      data: { ...data, updatedById },
      include: {
        brandTranslations: { where: { deletedAt: null } },
      },
    })
  }

  delete(id: number, deletedById: number, isHard = false): Promise<BrandType> {
    if (isHard) {
      return this.prismaService.brand.delete({
        where: { id },
      })
    }
    return this.prismaService.brand.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById },
    })
  }
}
