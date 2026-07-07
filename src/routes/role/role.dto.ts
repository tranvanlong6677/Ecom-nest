import { createZodDto } from 'nestjs-zod'
import {
  CreateRoleBodySchema,
  DeleteRoleQuerySchema,
  GetRoleParamsSchema,
  GetRolesQuerySchema,
  GetRolesResSchema,
  RoleWithPermissionsSchema,
  UpdateRoleBodySchema,
} from './role.model'

export class GetRolesResDTO extends createZodDto(GetRolesResSchema) {}

export class GetRolesQueryDTO extends createZodDto(GetRolesQuerySchema) {}

export class GetRoleParamsDTO extends createZodDto(GetRoleParamsSchema) {}

export class DeleteRoleQueryDTO extends createZodDto(DeleteRoleQuerySchema) {}

export class CreateRoleBodyDTO extends createZodDto(CreateRoleBodySchema) {}

export class UpdateRoleBodyDTO extends createZodDto(UpdateRoleBodySchema) {}

export class RoleResDTO extends createZodDto(RoleWithPermissionsSchema) {}
