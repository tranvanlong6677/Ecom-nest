import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { RoleName } from '@/shared/constants/role.constant'

@Injectable()
export class RolesService {
  private clientRoleId: number | null = null

  constructor(private readonly prismaService: PrismaService) {}

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }
    const role = await this.prismaService.role.findFirstOrThrow({
      where: {
        name: RoleName.Client,
      },
    })
    this.clientRoleId = role.id
    return role.id
  }
}
