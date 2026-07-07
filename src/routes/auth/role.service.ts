import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { RoleName } from '@/shared/constants/role.constant'
import { RoleType } from '@/routes/role/role.model'

@Injectable()
export class RolesService {
  private clientRoleId: number | null = null

  constructor(private readonly prismaService: PrismaService) {}

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }
    const role: RoleType = await this.prismaService.$queryRaw<
      RoleType[]
    >`SELECT * FROM "Role" WHERE name = ${RoleName.Client} AND "deletedAt" IS NULL LIMIT 1;`.then((res) => {
      if (res.length === 0) {
        throw new Error('Client role not found')
      }
      return res[0]
    })
    this.clientRoleId = role.id
    return role.id
  }
}
