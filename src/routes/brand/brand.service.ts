import { Injectable } from '@nestjs/common'
import { isNotFoundPrismaError } from '@/shared/helper'
import { BrandException } from '@/shared/models/error.model'
import { BrandRepository } from './brand.repo'
import { CreateBrandBodyType, GetBrandsQueryType, UpdateBrandBodyType } from './brand.model'

@Injectable()
export class BrandService {
  constructor(private readonly brandRepo: BrandRepository) {}

  async findAll(query: GetBrandsQueryType) {
    const { data, totalItems } = await this.brandRepo.findAll(query)
    return {
      data,
      totalItems,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalItems / query.limit),
    }
  }

  async findById(id: number) {
    const brand = await this.brandRepo.findById(id)
    if (!brand) {
      throw BrandException.NotFound
    }
    return brand
  }

  create(body: CreateBrandBodyType, createdById: number) {
    return this.brandRepo.create(body, createdById)
  }

  async update(id: number, body: UpdateBrandBodyType, updatedById: number) {
    try {
      return await this.brandRepo.update(id, body, updatedById)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw BrandException.NotFound
      }
      throw error
    }
  }

  async delete(id: number, deletedById: number, isHard = false) {
    try {
      await this.brandRepo.delete(id, deletedById, isHard)
      return { message: 'Brand deleted successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw BrandException.NotFound
      }
      throw error
    }
  }
}
