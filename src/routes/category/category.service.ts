import { Injectable } from '@nestjs/common'
import { isForeignKeyConstraintPrismaError, isNotFoundPrismaError } from '@/shared/helper'
import { CategoryException } from '@/shared/models/error.model'
import { CategoryIncludeTranslationType } from '@/shared/models/category.model'
import { CategoryRepository } from './category.repo'
import { CategoryTreeNodeType, CreateCategoryBodyType, UpdateCategoryBodyType } from './category.model'

function buildCategoryTree(categories: CategoryIncludeTranslationType[]): CategoryTreeNodeType[] {
  const nodeById = new Map<number, CategoryTreeNodeType>()
  categories.forEach((category) => {
    nodeById.set(category.id, { ...category, childrenCategories: [] })
  })

  const roots: CategoryTreeNodeType[] = []
  nodeById.forEach((node) => {
    if (node.parentCategoryId === null) {
      roots.push(node)
    } else {
      nodeById.get(node.parentCategoryId)?.childrenCategories.push(node)
    }
  })

  return roots
}

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  async findAll(parentCategoryId?: number) {
    const { data, totalItems } = await this.categoryRepo.findAll(parentCategoryId)
    return { data, totalItems }
  }

  async getTree() {
    const categories = await this.categoryRepo.findAllForTree()
    return { data: buildCategoryTree(categories) }
  }

  async findById(id: number) {
    const category = await this.categoryRepo.findById(id)
    if (!category) {
      throw CategoryException.NotFound
    }
    return category
  }

  async create(body: CreateCategoryBodyType, createdById: number) {
    try {
      return await this.categoryRepo.create(body, createdById)
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw CategoryException.ParentCategoryNotFound
      }
      throw error
    }
  }

  async update(id: number, body: UpdateCategoryBodyType, updatedById: number) {
    try {
      return await this.categoryRepo.update(id, body, updatedById)
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw CategoryException.ParentCategoryNotFound
      }
      if (isNotFoundPrismaError(error)) {
        throw CategoryException.NotFound
      }
      throw error
    }
  }

  async delete(id: number, deletedById: number, isHard = false) {
    try {
      await this.categoryRepo.delete(id, deletedById, isHard)
      return { message: 'Category deleted successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw CategoryException.NotFound
      }
      throw error
    }
  }
}
