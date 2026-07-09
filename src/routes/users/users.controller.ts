import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common'
import { UsersService } from './users.service'
import {
  CreateUserBodyDto,
  CreateUserResDto,
  GetUserDetailResDto,
  GetUsersResDto,
  UpdateUserBodyDto,
  UpdateUserResDto,
} from './users.dto'
import { QueryParamsDto } from '@/shared/dtos/request.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ResponseMessage } from '@/shared/decorators/response-message.decorator'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('Create user successfully!')
  @ZodSerializerDto(CreateUserResDto)
  create(@Body() createUserDto: CreateUserBodyDto, @ActiveUser('roleName') roleName: string) {
    return this.usersService.create(createUserDto, roleName)
  }

  @Get()
  @ResponseMessage('Get list users successfully!')
  @ZodSerializerDto(GetUsersResDto)
  getList(@Query() query: QueryParamsDto) {
    return this.usersService.getList(query)
  }

  @Get(':id')
  @ResponseMessage('Get user successfully!')
  @ZodSerializerDto(GetUserDetailResDto)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id)
  }

  @Put(':id')
  @ResponseMessage('Update user successfully!')
  @ZodSerializerDto(UpdateUserResDto)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserBodyDto,
    @ActiveUser('userId') userId: number,
    @ActiveUser('roleName') roleName: string,
  ) {
    return this.usersService.update(+id, updateUserDto, userId, roleName)
  }

  @Delete(':id')
  @ResponseMessage('Delete user successfully!')
  remove(@Param('id') id: string, @ActiveUser('userId') userId: number, @ActiveUser('roleName') roleName: string) {
    return this.usersService.remove(+id, userId, roleName)
  }
}
