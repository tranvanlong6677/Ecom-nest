import { createZodDto } from 'nestjs-zod'
import { PresignedUploadFileBodySchema, PresignedUploadFileResSchema } from './media.model'

export class PresignedUploadFileBodyDto extends createZodDto(PresignedUploadFileBodySchema) {}

export class PresignedUploadFileResDto extends createZodDto(PresignedUploadFileResSchema) {}
