import { createZodDto } from 'nestjs-zod'
import {
  CreatePermissionBodySchema,
  DeletePermissionQuerySchema,
  GetPermissionParamsSchema,
  GetPermissionsQuerySchema,
  GetPermissionsResSchema,
  UpdatePermissionBodySchema,
} from './permission.model'
import { PermissionSchema } from '@/shared/models/permission.model'

export class GetPermissionsResDTO extends createZodDto(GetPermissionsResSchema) {}

export class GetPermissionsQueryDTO extends createZodDto(GetPermissionsQuerySchema) {}

export class DeletePermissionQueryDTO extends createZodDto(DeletePermissionQuerySchema) {}

export class GetPermissionParamsDTO extends createZodDto(GetPermissionParamsSchema) {}

export class CreatePermissionBodyDTO extends createZodDto(CreatePermissionBodySchema) {}

export class UpdatePermissionBodyDTO extends createZodDto(UpdatePermissionBodySchema) {}

export class PermissionResDTO extends createZodDto(PermissionSchema) {}
