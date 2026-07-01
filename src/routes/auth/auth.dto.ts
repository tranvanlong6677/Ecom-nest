import { createZodDto } from 'nestjs-zod'
import { LoginBodySchema, RegisterBodySchema, RegisterResSchema, SendOTPBodySchema } from './auth.model'

export class RegisterResDTO extends createZodDto(RegisterResSchema) {}

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}

export class LoginDto extends createZodDto(LoginBodySchema) {}

export class SendOTPBodyDto extends createZodDto(SendOTPBodySchema) {}
