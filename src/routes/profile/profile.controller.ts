import { Controller, Get, Body, Put } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { ChangePasswordBodyDTO, ProfileResDTO, UpdateProfileBodyDTO, UpdateProfileResDTO } from './profile.dto'

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodSerializerDto(ProfileResDTO)
  getProfile(@ActiveUser('userId') userId: number) {
    return this.profileService.getProfile(userId)
  }

  @Put('update')
  @ZodSerializerDto(UpdateProfileResDTO)
  update(@ActiveUser('userId') userId: number, @Body() updateProfileDto: UpdateProfileBodyDTO) {
    return this.profileService.updateProfile(userId, updateProfileDto)
  }

  @Put('change-password')
  @ZodSerializerDto(MessageResDTO)
  changePassword(@Body() data: ChangePasswordBodyDTO, @ActiveUser('userId') userId: number) {
    return this.profileService.changePassword(userId, data)
  }
}
