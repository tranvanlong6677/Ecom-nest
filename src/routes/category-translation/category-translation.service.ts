import { Injectable } from '@nestjs/common'
import { isForeignKeyConstraintPrismaError, isNotFoundPrismaError } from '@/shared/helper'
import { CategoryTranslationException } from '@/shared/models/error.model'
import { CategoryTranslationRepository } from './category-translation.repo'
import { CreateCategoryTranslationBodyType, UpdateCategoryTranslationBodyType } from './category-translation.model'

@Injectable()
export class CategoryTranslationService {
  constructor(private readonly categoryTranslationRepo: CategoryTranslationRepository) {}

  async findById(id: number) {
    const categoryTranslation = await this.categoryTranslationRepo.findById(id)
    if (!categoryTranslation) {
      throw CategoryTranslationException.NotFound
    }
    return categoryTranslation
  }

  async create(body: CreateCategoryTranslationBodyType, createdById: number) {
    const existing = await this.categoryTranslationRepo.findByCategoryAndLanguage(body.categoryId, body.languageId)
    if (existing) {
      throw CategoryTranslationException.AlreadyExists
    }
    try {
      return await this.categoryTranslationRepo.create(body, createdById)
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw CategoryTranslationException.InvalidCategoryOrLanguage
      }
      throw error
    }
  }

  async update(id: number, body: UpdateCategoryTranslationBodyType, updatedById: number) {
    try {
      return await this.categoryTranslationRepo.update(id, body, updatedById)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw CategoryTranslationException.NotFound
      }
      throw error
    }
  }

  async delete(id: number, deletedById: number, isHard = false) {
    try {
      await this.categoryTranslationRepo.delete(id, deletedById, isHard)
      return { message: 'Category translation deleted successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw CategoryTranslationException.NotFound
      }
      throw error
    }
  }
}
