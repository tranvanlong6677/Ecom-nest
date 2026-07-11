import { Injectable } from '@nestjs/common'
import { isForeignKeyConstraintPrismaError, isNotFoundPrismaError } from '@/shared/helper'
import { BrandTranslationException } from '@/shared/models/error.model'
import { BrandTranslationRepository } from './brand-translation.repo'
import { CreateBrandTranslationBodyType, UpdateBrandTranslationBodyType } from './brand-translation.model'

@Injectable()
export class BrandTranslationService {
  constructor(private readonly brandTranslationRepo: BrandTranslationRepository) {}

  async findById(id: number) {
    const brandTranslation = await this.brandTranslationRepo.findById(id)
    if (!brandTranslation) {
      throw BrandTranslationException.NotFound
    }
    return brandTranslation
  }

  async create(body: CreateBrandTranslationBodyType, createdById: number) {
    const existing = await this.brandTranslationRepo.findByBrandAndLanguage(body.brandId, body.languageId)
    if (existing) {
      throw BrandTranslationException.AlreadyExists
    }
    try {
      return await this.brandTranslationRepo.create(body, createdById)
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw BrandTranslationException.InvalidBrandOrLanguage
      }
      throw error
    }
  }

  async update(id: number, body: UpdateBrandTranslationBodyType, updatedById: number) {
    try {
      return await this.brandTranslationRepo.update(id, body, updatedById)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw BrandTranslationException.NotFound
      }
      throw error
    }
  }

  async delete(id: number, deletedById: number, isHard = false) {
    try {
      await this.brandTranslationRepo.delete(id, deletedById, isHard)
      return { message: 'Brand translation deleted successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw BrandTranslationException.NotFound
      }
      throw error
    }
  }
}
