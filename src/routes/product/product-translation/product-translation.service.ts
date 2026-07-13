import { Injectable } from '@nestjs/common'
import { isForeignKeyConstraintPrismaError, isNotFoundPrismaError } from '@/shared/helper'
import { ProductTranslationException } from '@/shared/models/error.model'
import { ProductTranslationRepo } from './product-translation.repo'
import { CreateProductTranslationBodyType, UpdateProductTranslationBodyType } from './product-translation.model'

@Injectable()
export class ProductTranslationService {
  constructor(private readonly productTranslationRepo: ProductTranslationRepo) {}

  async findById(id: number) {
    const productTranslation = await this.productTranslationRepo.findById(id)
    if (!productTranslation) {
      throw ProductTranslationException.NotFound
    }
    return productTranslation
  }

  async create(body: CreateProductTranslationBodyType, createdById: number) {
    const existing = await this.productTranslationRepo.findByProductAndLanguage(body.productId, body.languageId)
    if (existing) {
      throw ProductTranslationException.AlreadyExists
    }
    try {
      return await this.productTranslationRepo.create(body, createdById)
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw ProductTranslationException.InvalidProductOrLanguage
      }
      throw error
    }
  }

  async update(id: number, body: UpdateProductTranslationBodyType, updatedById: number) {
    try {
      return await this.productTranslationRepo.update(id, body, updatedById)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw ProductTranslationException.NotFound
      }
      throw error
    }
  }

  async delete(id: number, deletedById: number, isHard = false) {
    try {
      await this.productTranslationRepo.delete(id, deletedById, isHard)
      return { message: 'Product translation deleted successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw ProductTranslationException.NotFound
      }
      throw error
    }
  }
}
