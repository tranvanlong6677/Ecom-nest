import { Injectable, UnauthorizedException } from '@nestjs/common'
import type { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt'
import { JwtService as Jwt } from '@nestjs/jwt'
import type { StringValue } from 'ms'
import envConfig from '@/shared/config'
import { TokenPayload } from '@/shared/types/jwt.type'

@Injectable()
export class JwtService {
  constructor(private readonly jwt: Jwt) {}

  signAsync(payload: Partial<any>, options?: JwtSignOptions): Promise<string> {
    return this.jwt.signAsync(payload, options)
  }

  signAccessToken(payload: { userId: number }) {
    return this.jwt.signAsync(payload, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
      expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN as StringValue,
      algorithm: 'HS256',
    })
  }

  signRefreshToken(payload: { userId: number }) {
    return this.jwt.signAsync(payload, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
      expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN as StringValue,
      algorithm: 'HS256',
    })
  }

  verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwt.verifyAsync(token, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
    })
  }

  verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.jwt.verifyAsync(token, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
    })
  }

  async verifyAsync(token: string, options?: JwtVerifyOptions): Promise<unknown> {
    try {
      return await this.jwt.verifyAsync(token, options)
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }

  decode(token: string): unknown {
    return this.jwt.decode(token, { complete: false })
  }

  async generateToken(payload: Partial<any>) {
    const [token, refreshToken] = await Promise.all([
      this.signAsync(payload, {
        secret: envConfig.ACCESS_TOKEN_SECRET,
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN as StringValue,
      }),
      this.signAsync(payload, {
        secret: envConfig.REFRESH_TOKEN_SECRET,
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN as StringValue,
      }),
    ])
    return { token, refreshToken }
  }
}
