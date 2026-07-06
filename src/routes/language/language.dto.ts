import { createZodDto } from 'nestjs-zod'
import {
  CreateLanguageBodySchema,
  GetLanguageParamsSchema,
  GetLanguagesResSchema,
  LanguageSchema,
  UpdateLanguageBodySchema,
} from './language.model'

export class GetLanguagesResDTO extends createZodDto(GetLanguagesResSchema) {}

export class GetLanguageParamsDTO extends createZodDto(GetLanguageParamsSchema) {}

export class CreateLanguageBodyDTO extends createZodDto(CreateLanguageBodySchema) {}

export class UpdateLanguageBodyDTO extends createZodDto(UpdateLanguageBodySchema) {}

export class LanguageResDTO extends createZodDto(LanguageSchema) {}
