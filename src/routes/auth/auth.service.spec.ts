import { UnprocessableEntityException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthRepository } from './auth.repo'
import { RolesService } from './role.service'
import { HashingService } from '@/shared/services/hashing.service'
import { PrismaService } from '@/shared/services/prisma.service'
import { TokenService } from '@/shared/services/token.service'
import { SharedRepository } from '@/shared/repository/shared-user.repo'
import { EmailService } from '@/shared/services/email.service'

function buildService() {
  const hashingService = { hash: jest.fn(), compare: jest.fn() } as unknown as jest.Mocked<HashingService>
  const prismaService = {} as PrismaService
  const tokenService = {} as TokenService
  const rolesService = {} as unknown as jest.Mocked<RolesService>
  const authRepo = {
    createDevice: jest.fn(),
    findUserWithRole: jest.fn(),
    generateTokens: jest.fn(),
  } as unknown as jest.Mocked<AuthRepository>
  const sharedRepo = { findUser: jest.fn() } as unknown as jest.Mocked<SharedRepository>
  const emailService = {} as EmailService

  const service = new AuthService(
    hashingService,
    prismaService,
    tokenService,
    rolesService,
    authRepo,
    sharedRepo,
    emailService,
  )

  return { service, hashingService, authRepo, sharedRepo }
}

describe('AuthService', () => {
  describe('login', () => {
    it('throws UnprocessableEntityException without calling compare when the account has no password (OAuth-only account)', async () => {
      const { service, hashingService, sharedRepo } = buildService()
      sharedRepo.findUser.mockResolvedValue({
        id: 1,
        email: 'oauth-user@example.com',
        password: null,
        roleId: 2,
      } as any)

      await expect(
        service.login({ email: 'oauth-user@example.com', password: 'anything', userAgent: 'jest', ip: '127.0.0.1' }),
      ).rejects.toThrow(UnprocessableEntityException)
      expect(hashingService.compare).not.toHaveBeenCalled()
    })

    it('still calls hashingService.compare for a normal password-based account', async () => {
      const { service, hashingService, sharedRepo, authRepo } = buildService()
      sharedRepo.findUser.mockResolvedValue({ id: 1, email: 'user@example.com', password: 'hashed', roleId: 2 } as any)
      hashingService.compare.mockResolvedValue(true)
      authRepo.createDevice.mockResolvedValue({ id: 10 } as any)
      authRepo.findUserWithRole.mockResolvedValue({ id: 1, roleId: 2, role: { name: 'CLIENT' } } as any)
      authRepo.generateTokens.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' })

      await service.login({ email: 'user@example.com', password: 'plain', userAgent: 'jest', ip: '127.0.0.1' })

      expect(hashingService.compare).toHaveBeenCalledWith('plain', 'hashed')
    })
  })
})
