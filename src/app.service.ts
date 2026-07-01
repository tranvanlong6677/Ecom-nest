import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!'
  }
}
