import { createZodDto } from 'nestjs-zod'
import { EmptyBodySchema, PaginationParamsSchema } from '../models/request.model'

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}

export class PaginationParamsDto extends createZodDto(PaginationParamsSchema) {}
