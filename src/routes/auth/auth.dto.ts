import { createZodDto } from 'nestjs-zod'
import { LoginBodySchema, RegisterBodySchema, RegisterResSchema } from './auth.model'

export class RegisterResDTO extends createZodDto(RegisterResSchema) {}

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}

export class LoginDto extends createZodDto(LoginBodySchema) {}
