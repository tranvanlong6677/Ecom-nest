import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { CreateLanguageBodyType, LanguageType, UpdateLanguageBodyType } from './language.model'

@Injectable()
export class LanguageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(): Promise<LanguageType[]> {
    return this.prismaService.language.findMany({
      where: { deletedAt: null },
    })
  }

  findById(id: string): Promise<LanguageType | null> {
    return this.prismaService.language.findFirst({
      where: { id, deletedAt: null },
    })
  }

  create(data: CreateLanguageBodyType, createdById: number): Promise<LanguageType> {
    return this.prismaService.language.create({
      data: { ...data, createdById },
    })
  }

  update(id: string, data: UpdateLanguageBodyType, updatedById: number): Promise<LanguageType> {
    return this.prismaService.language.update({
      where: { id, deletedAt: null },
      data: { ...data, updatedById },
    })
  }

  delete(id: string, deletedById: number): Promise<LanguageType> {
    return this.prismaService.language.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: deletedById },
    })
  }
}
