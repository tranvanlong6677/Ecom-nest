import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { render } from '@react-email/render'
import { Resend } from 'resend'
import envConfig from '@/shared/config'
import { VerificationCodePurposeType } from '@/routes/auth/auth.model'
import { OtpEmail } from '@/shared/emails/otp-email'

@Injectable()
export class EmailService {
  private readonly resend = new Resend(envConfig.RESEND_API_KEY)

  async sendOtp(payload: {
    email: string
    code: string
    expiresInMinutes: number
    type: VerificationCodePurposeType
  }): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: envConfig.RESEND_FROM_EMAIL,
      to: [payload.email],
      // to: ['tranvanlong6677@gmail.com'],
      subject: `Mã OTP-${payload.type.toUpperCase()} của bạn: ${payload.code}`,
      html: await render(
        OtpEmail({ code: payload.code, expiresInMinutes: payload.expiresInMinutes, type: payload.type }),
      ),
    })

    if (error) {
      console.error('[EmailService] Resend error:', error)
      throw new InternalServerErrorException({ path: 'code', message: 'Không thể gửi email OTP' })
    }
  }
}
