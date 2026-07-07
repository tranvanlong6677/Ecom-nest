import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { PermissionService } from './permission.service'
import {
  CreatePermissionBodyDTO,
  DeletePermissionQueryDTO,
  GetPermissionParamsDTO,
  GetPermissionsQueryDTO,
  GetPermissionsResDTO,
  PermissionResDTO,
  UpdatePermissionBodyDTO,
} from './permission.dto'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ZodSerializerDto(GetPermissionsResDTO)
  findAll(@Query() query: GetPermissionsQueryDTO) {
    return this.permissionService.findAll(query)
  }

  @Get(':permissionId')
  @ZodSerializerDto(PermissionResDTO)
  findById(@Param() params: GetPermissionParamsDTO) {
    return this.permissionService.findById(params.permissionId)
  }

  @Post()
  @ZodSerializerDto(PermissionResDTO)
  create(@Body() body: CreatePermissionBodyDTO, @ActiveUser('userId') userId: number) {
    return this.permissionService.create(body, userId)
  }

  @Put(':permissionId')
  @ZodSerializerDto(PermissionResDTO)
  update(
    @Param() params: GetPermissionParamsDTO,
    @Body() body: UpdatePermissionBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.permissionService.update(params.permissionId, body, userId)
  }

  @Delete(':permissionId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetPermissionParamsDTO,
    @Query() query: DeletePermissionQueryDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.permissionService.delete(params.permissionId, userId, query.hardDelete)
  }
}
