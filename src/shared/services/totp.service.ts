import * as OTPAuth from 'otpauth'
import { Injectable } from '@nestjs/common'
import envConfig from '@/shared/config'

@Injectable()
export class TotpService {
  private createTOTP(email: string, secret: string) {
    return new OTPAuth.TOTP({
      issuer: envConfig.APP_NAME,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    })
  }

  generateSecret(): string {
    return new OTPAuth.Secret().base32 // secret dạng string để lưu DB
  }

  verify({ email, secret, totpCode }: { email: string; secret: string; totpCode: string }): boolean {
    const totp = this.createTOTP(email, secret)
    const result = totp.validate({ token: totpCode, window: 1 })
    return result !== null
  }

  getKeyUri({ email, secret }: { email: string; secret: string }): string {
    const totp = this.createTOTP(email, secret)
    return totp.toString() // đây là "Key URI"
  }
}
