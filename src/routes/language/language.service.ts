import { Injectable } from '@nestjs/common'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helper'
import { LanguageException } from '@/shared/models/error.model'
import { LanguageRepository } from './language.repo'
import { CreateLanguageBodyType, UpdateLanguageBodyType } from './language.model'

@Injectable()
export class LanguageService {
  constructor(private readonly languageRepo: LanguageRepository) {}

  async findAll() {
    const data = await this.languageRepo.findAll()
    return {
      data,
      totalItems: data.length,
    }
  }

  async findById(id: string) {
    const language = await this.languageRepo.findById(id)
    if (!language) {
      throw LanguageException.NotFound
    }
    return language
  }

  async create(body: CreateLanguageBodyType, createdById: number) {
    try {
      return await this.languageRepo.create(body, createdById)
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw LanguageException.AlreadyExists
      }
      throw error
    }
  }

  async update(id: string, body: UpdateLanguageBodyType, updatedById: number) {
    try {
      return await this.languageRepo.update(id, body, updatedById)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw LanguageException.NotFound
      }
      throw error
    }
  }

  async delete(id: string, deletedById: number) {
    try {
      await this.languageRepo.delete(id, deletedById)
      return { message: 'Language deleted successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw LanguageException.NotFound
      }
      throw error
    }
  }
}
