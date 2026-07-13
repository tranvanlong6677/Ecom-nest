import { Injectable } from '@nestjs/common'
import { isForeignKeyConstraintPrismaError, isNotFoundPrismaError } from '@/shared/helper'
import { ProductException } from '@/shared/models/error.model'
import { ProductRepo } from './product.repo'
import { CreateProductBodyType, GetProductsQueryType, UpdateProductBodyType } from './product.model'

@Injectable()
export class ProductService {
  constructor(private readonly productRepo: ProductRepo) {}

  list(query: GetProductsQueryType, languageId: string) {
    return this.productRepo.list(query, languageId)
  }

  async findById(id: number, languageId: string) {
    const product = await this.productRepo.findById(id, languageId)
    if (!product) {
      throw ProductException.NotFound
    }
    return product
  }

  async create(data: CreateProductBodyType, createdById: number) {
    try {
      return await this.productRepo.create({ createdById, data })
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw ProductException.InvalidBrand
      }
      if (isNotFoundPrismaError(error)) {
        throw ProductException.InvalidCategory
      }
      throw error
    }
  }

  async update(id: number, data: UpdateProductBodyType, updatedById: number) {
    try {
      return await this.productRepo.update({ id, updatedById, data })
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw ProductException.InvalidBrand
      }
      if (isNotFoundPrismaError(error)) {
        throw ProductException.NotFound
      }
      throw error
    }
  }

  async delete(id: number, deletedById: number, isHard = false) {
    try {
      await this.productRepo.delete({ id, deletedById }, isHard)
      return { message: 'Product deleted successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw ProductException.NotFound
      }
      throw error
    }
  }
}
