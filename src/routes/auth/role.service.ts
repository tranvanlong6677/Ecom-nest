import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { RoleName } from '@/shared/constants/role.constant'

@Injectable()
export class RolesService {
  private clientRoleId: number | null = null

  constructor(private readonly prismaService: PrismaService) {}

  async getClientRoleId() {
    if (this.clientRoleId) {
      console.log('get client role id from cache: ', this.clientRoleId)
      return this.clientRoleId
    }
    const role = await this.prismaService.role.findFirstOrThrow({
      where: {
        name: RoleName.Client,
      },
    })
    console.log('get client role id from db: ', role.id)
    this.clientRoleId = role.id
    return role.id
  }
}
