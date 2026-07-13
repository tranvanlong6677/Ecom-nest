import { Injectable } from '@nestjs/common'
import { isForeignKeyConstraintPrismaError, isNotFoundPrismaError } from '@/shared/helper'
import { ProductException } from '@/shared/models/error.model'
import { RoleName } from '@/shared/constants/role.constant'
import { ProductRepo } from './product.repo'
import { CreateProductBodyType, GetManageProductsQueryType, UpdateProductBodyType } from './product.model'

@Injectable()
export class ManageProductService {
  constructor(private readonly productRepo: ProductRepo) {}

  validatePrivilege({
    userIdRequest,
    roleNameRequest,
    createdById,
  }: {
    userIdRequest: number
    roleNameRequest: string
    createdById: number | null
  }): boolean {
    if (userIdRequest !== createdById && roleNameRequest !== RoleName.Admin) {
      throw ProductException.Forbidden
    }
    return true
  }

  list(
    query: GetManageProductsQueryType,
    {
      userIdRequest,
      roleNameRequest,
      languageId,
    }: { userIdRequest: number; roleNameRequest: string; languageId: string },
  ) {
    this.validatePrivilege({ userIdRequest, roleNameRequest, createdById: query.createdById })
    return this.productRepo.list({
      query,
      languageId,
      isPublic: query.isPublic,
      createdById: query.createdById,
    })
  }

  async getDetail({
    productId,
    languageId,
    userIdRequest,
    roleNameRequest,
  }: {
    productId: number
    languageId: string
    userIdRequest: number
    roleNameRequest: string
  }) {
    const product = await this.productRepo.findById(productId)
    if (!product) {
      throw ProductException.NotFound
    }
    this.validatePrivilege({ userIdRequest, roleNameRequest, createdById: product.createdById })
    return this.productRepo.getDetail({ productId, languageId })
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

  async update({
    productId,
    data,
    userIdRequest,
    roleNameRequest,
  }: {
    productId: number
    data: UpdateProductBodyType
    userIdRequest: number
    roleNameRequest: string
  }) {
    const product = await this.productRepo.findById(productId)
    if (!product) {
      throw ProductException.NotFound
    }
    this.validatePrivilege({ userIdRequest, roleNameRequest, createdById: product.createdById })
    try {
      return await this.productRepo.update({ id: productId, updatedById: userIdRequest, data })
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

  async delete({
    productId,
    userIdRequest,
    roleNameRequest,
    isHard,
  }: {
    productId: number
    userIdRequest: number
    roleNameRequest: string
    isHard?: boolean
  }) {
    const product = await this.productRepo.findById(productId)
    if (!product) {
      throw ProductException.NotFound
    }
    this.validatePrivilege({ userIdRequest, roleNameRequest, createdById: product.createdById })
    try {
      await this.productRepo.delete({ id: productId, deletedById: userIdRequest }, isHard)
      return { message: 'Product deleted successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw ProductException.NotFound
      }
      throw error
    }
  }
}
