import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { RoleService } from './role.service'
import {
  CreateRoleBodyDTO,
  DeleteRoleQueryDTO,
  GetRoleParamsDTO,
  GetRolesQueryDTO,
  GetRolesResDTO,
  RoleResDTO,
  UpdateRoleBodyDTO,
} from './role.dto'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ZodSerializerDto(GetRolesResDTO)
  findAll(@Query() query: GetRolesQueryDTO) {
    return this.roleService.findAll(query)
  }

  @Get(':roleId')
  @ZodSerializerDto(RoleResDTO)
  findById(@Param() params: GetRoleParamsDTO) {
    return this.roleService.findById(params.roleId)
  }

  @Post()
  @ZodSerializerDto(RoleResDTO)
  create(@Body() body: CreateRoleBodyDTO, @ActiveUser('userId') userId: number) {
    return this.roleService.create(body, userId)
  }

  @Put(':roleId')
  @ZodSerializerDto(RoleResDTO)
  update(@Param() params: GetRoleParamsDTO, @Body() body: UpdateRoleBodyDTO, @ActiveUser('userId') userId: number) {
    return this.roleService.update(params.roleId, body, userId)
  }

  @Delete(':roleId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetRoleParamsDTO, @Query() query: DeleteRoleQueryDTO, @ActiveUser('userId') userId: number) {
    return this.roleService.delete(params.roleId, userId, query.hardDelete)
  }
}
