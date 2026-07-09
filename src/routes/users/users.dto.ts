import { createZodDto } from 'nestjs-zod'
import {
  CreateUserBodySchema,
  CreateUserResSchema,
  GetUserDetailResSchema,
  GetUsersResSchema,
  UpdateUserBodySchema,
  UpdateUserResSchema,
} from './users.model'

export class CreateUserBodyDto extends createZodDto(CreateUserBodySchema) {}

export class CreateUserResDto extends createZodDto(CreateUserResSchema) {}

export class GetUsersResDto extends createZodDto(GetUsersResSchema) {}

export class UpdateUserBodyDto extends createZodDto(UpdateUserBodySchema) {}

export class GetUserDetailResDto extends createZodDto(GetUserDetailResSchema) {}

export class UpdateUserResDto extends createZodDto(UpdateUserResSchema) {}
