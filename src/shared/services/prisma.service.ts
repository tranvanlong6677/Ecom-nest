import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
import envConfig from '@/shared/config'

@Injectable()
export class PrismaService implements OnModuleInit {
  constructor() {
    const adapter = new PrismaPg({ connectionString: envConfig.DATABASE_URL })
    const client = new (PrismaClient as any)({ adapter, log: ['info'] })

    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) return Reflect.get(target, prop, receiver)
        const value = client[prop]
        return typeof value === 'function' ? value.bind(client) : value
      },
    })
  }

  async onModuleInit() {
    await (this as any).$connect()
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PrismaService extends PrismaClient {}
