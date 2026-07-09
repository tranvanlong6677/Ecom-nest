import { Injectable } from '@nestjs/common'
import { ProfileRepository } from './profile.repo'
import { ChangePasswordBodyType, UpdateProfileBodyType } from './profile.model'
import { PasswordException, UserException } from '@/shared/models/error.model'
import { HashingService } from '@/shared/services/hashing.service'
import { SharedUserRepository } from '@/shared/repository/shared-user.repo'
import { isNotFoundPrismaError } from '@/shared/helper'

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly hashingService: HashingService,
    private readonly sharedUserRepo: SharedUserRepository,
  ) {}

  async getProfile(id: number) {
    try {
      const profile = await this.profileRepo.getProfile(id)
      return profile
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw UserException.NotFound
      }
      throw error
    }
  }

  async updateProfile(id: number, data: UpdateProfileBodyType) {
    try {
      const updatedProfile = await this.profileRepo.updateProfile(id, data)
      return updatedProfile
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw UserException.NotFound
      }
      throw error
    }
  }

  async changePassword(userId: number, data: ChangePasswordBodyType) {
    try {
      const user = await this.sharedUserRepo.findUser({ id: userId })
      if (!user) {
        throw UserException.NotFound
      }
      if (!user.password) {
        throw PasswordException.Mismatch
      }
      const isMatch = await this.hashingService.compare(data.currentPassword, user.password)
      if (!isMatch) {
        throw PasswordException.Mismatch
      }

      // hash new password
      const newPassword = await this.hashingService.hash(data.newPassword)
      // update password
      await this.profileRepo.updatePassword(userId, newPassword)
      return { message: 'Password changed successfully' }
    } catch (error) {
      throw error
    }
  }
}
