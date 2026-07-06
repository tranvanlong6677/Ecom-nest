import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import * as React from 'react'
import { VerificationCodePurposeType } from '@/routes/auth/auth.model'

const PURPOSE_LABEL: Record<VerificationCodePurposeType, string> = {
  REGISTER: 'Xác thực đăng ký',
  FORGOT_PASSWORD: 'Đặt lại mật khẩu',
  LOGIN: 'Đăng nhập',
  DISABLE_2FA: 'Tắt 2FA',
}

interface OtpEmailProps {
  code: string
  expiresInMinutes: number
  type: VerificationCodePurposeType
}

export function OtpEmail({ code, expiresInMinutes, type }: OtpEmailProps) {
  return (
    <Html lang="vi">
      <Head />
      <Preview>
        Mã OTP {PURPOSE_LABEL[type]}: {code}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{PURPOSE_LABEL[type]}</Heading>
          <Text style={subtext}>Mã xác thực OTP của bạn:</Text>
          <Section style={codeBox}>
            <Text style={codeText}>{code}</Text>
          </Section>
          <Text style={footer}>
            Mã có hiệu lực trong <strong>{expiresInMinutes} phút</strong>. Không chia sẻ mã này với bất kỳ ai.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '32px',
  borderRadius: '8px',
  maxWidth: '480px',
}

const heading = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 8px',
}

const subtext = {
  fontSize: '15px',
  color: '#555555',
  margin: '0 0 16px',
}

const codeBox = {
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  padding: '16px 24px',
  textAlign: 'center' as const,
  margin: '0 0 16px',
}

const codeText = {
  fontSize: '36px',
  fontWeight: '700',
  letterSpacing: '8px',
  color: '#1a1a1a',
  margin: '0',
}

const footer = {
  fontSize: '13px',
  color: '#999999',
  margin: '0',
}
