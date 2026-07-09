import { createZodDto } from 'nestjs-zod'
import {
  ChangePasswordBodySchema,
  ProfileResSchema,
  UpdateProfileBodySchema,
  UpdateProfileResSchema,
} from './profile.model'

export class UpdateProfileBodyDTO extends createZodDto(UpdateProfileBodySchema) {}

export class ChangePasswordBodyDTO extends createZodDto(ChangePasswordBodySchema) {}

export class ProfileResDTO extends createZodDto(ProfileResSchema) {}

export class UpdateProfileResDTO extends createZodDto(UpdateProfileResSchema) {}
