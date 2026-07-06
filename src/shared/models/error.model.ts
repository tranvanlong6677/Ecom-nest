import { UnprocessableEntityException } from '@nestjs/common'

export const OtpException = {
  Invalid: new UnprocessableEntityException([
    { path: 'code', code: 'ERROR.OTP_INVALID', message: 'OTP code is invalid' },
  ]),
  Expired: new UnprocessableEntityException([
    { path: 'code', code: 'ERROR.OTP_EXPIRED', message: 'OTP code is expired' },
  ]),
  InvalidType: new UnprocessableEntityException([
    { path: 'type', code: 'ERROR.OTP_INVALID_TYPE', message: 'OTP type is invalid' },
  ]),
}

export const EmailException = {
  NotFound: new UnprocessableEntityException([
    { path: 'email', code: 'ERROR.EMAIL_NOT_FOUND', message: 'Email is not exist' },
  ]),
  Exists: new UnprocessableEntityException([
    { path: 'email', code: 'ERROR.EMAIL_ALREADY_EXISTS', message: 'Email already exists' },
  ]),
  Social: new UnprocessableEntityException([
    {
      path: 'email',
      code: 'ERROR.EMAIL_IS_SOCIAL_ACCOUNT',
      message: 'This account uses social login. Please continue with Google/Facebook/GitHub.',
    },
  ]),
  Invalid: new UnprocessableEntityException([
    { path: 'email', code: 'ERROR.EMAIL_INVALID', message: 'Email is invalid' },
  ]),
}

export const PasswordException = {
  Mismatch: new UnprocessableEntityException([
    { path: 'password', code: 'ERROR.PASSWORD_INCORRECT', message: 'Password is incorrect' },
  ]),

  MismatchConfirm: new UnprocessableEntityException([
    { path: 'confirmPassword', code: 'ERROR.PASSWORD_MISMATCH', message: 'Password and confirm password must be same' },
  ]),
}

export const EmailOrPasswordException = {
  Mismatch: new UnprocessableEntityException([
    { path: 'emailOrPassword', code: 'ERROR.EMAIL_OR_PASSWORD_INCORRECT', message: 'Email or password is incorrect' },
  ]),
}

export const DeviceException = {
  NotFound: new UnprocessableEntityException([
    { path: 'deviceId', code: 'ERROR.DEVICE_NOT_FOUND', message: 'Device is not exist' },
  ]),
}

export const TokenException = {
  NotFound: new UnprocessableEntityException([
    { path: 'refreshToken', code: 'ERROR.REFRESH_TOKEN_NOT_FOUND', message: 'Refresh token is not exist' },
  ]),
  Invalid: new UnprocessableEntityException([
    { path: 'refreshToken', code: 'ERROR.REFRESH_TOKEN_INVALID', message: 'Refresh token is invalid' },
  ]),
  Revoked: new UnprocessableEntityException([
    { path: 'refreshToken', code: 'ERROR.REFRESH_TOKEN_REVOKED', message: 'Refresh token is revoked' },
  ]),
}

export const TwoFactorException = {
  AlreadyEnabled: new UnprocessableEntityException([
    {
      path: 'totpCode',
      code: 'TwoFactorException.AlreadyEnabled',
      message: '2FA is already enabled',
    },
  ]),

  NotEnabled: new UnprocessableEntityException([
    {
      path: 'totpCode',
      code: 'TwoFactorException.NotEnabled',
      message: '2FA is not enabled',
    },
  ]),

  InvalidTOTP: new UnprocessableEntityException([
    { path: 'totpCode', code: 'TwoFactorException.InvalidTOTP', message: 'TOTP code is invalid' },
  ]),
}
export const UserException = {
  NotFound: new UnprocessableEntityException([
    { path: 'userId', code: 'ERROR.USER_NOT_FOUND', message: 'User is not exist' },
  ]),
}

export const LanguageException = {
  NotFound: new UnprocessableEntityException([
    { path: 'languageId', code: 'ERROR.LANGUAGE_NOT_FOUND', message: 'Language is not exist' },
  ]),
  AlreadyExists: new UnprocessableEntityException([
    { path: 'id', code: 'ERROR.LANGUAGE_ALREADY_EXISTS', message: 'Language id already exists' },
  ]),
}
