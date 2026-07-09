import { createZodDto } from 'nestjs-zod'
import { EmptyBodySchema, QueryParamsSchema } from '../models/request.model'

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}

export class QueryParamsDto extends createZodDto(QueryParamsSchema) {}
