import { ForbiddenException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'

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
  Forbidden: new UnprocessableEntityException([
    { path: 'refreshToken', code: 'ERROR.REFRESH_TOKEN_FORBIDDEN', message: 'Refresh token is not authorized' },
  ]),
  AccessDenied: new UnprocessableEntityException([
    { path: 'refreshToken', code: 'ERROR.REFRESH_TOKEN_ACCESS_DENIED', message: 'Refresh token is not allowed' },
  ]),
  Expired: new UnprocessableEntityException([
    { path: 'refreshToken', code: 'ERROR.REFRESH_TOKEN_EXPIRED', message: 'Refresh token is expired' },
  ]),
  AccessTokenMissing: new UnauthorizedException([
    { path: 'authorization', code: 'ERROR.ACCESS_TOKEN_MISSING', message: 'Access token is missing' },
  ]),
  AccessTokenInvalid: new UnauthorizedException([
    { path: 'authorization', code: 'ERROR.ACCESS_TOKEN_INVALID', message: 'Access token is invalid' },
  ]),
  AccessTokenExpired: new UnauthorizedException([
    { path: 'authorization', code: 'ERROR.ACCESS_TOKEN_EXPIRED', message: 'Access token is expired' },
  ]),
  AccessTokenAccessDenied: new ForbiddenException([
    {
      path: 'authorization',
      code: 'ERROR.ACCESS_TOKEN_ACCESS_DENIED',
      message: 'You do not have permission to access this resource',
    },
  ]),
}

export const TwoFactorException = {
  AlreadyEnabled: new UnprocessableEntityException([
    {
      path: 'totpCode',
      code: 'ERROR.TWO_FACTOR_ALREADY_ENABLED',
      message: '2FA is already enabled',
    },
  ]),

  NotEnabled: new UnprocessableEntityException([
    {
      path: 'totpCode',
      code: 'ERROR.TWO_FACTOR_NOT_ENABLED',
      message: '2FA is not enabled',
    },
  ]),

  InvalidTOTP: new UnprocessableEntityException([
    { path: 'totpCode', code: 'ERROR.TWO_FACTOR_INVALID_TOTP', message: 'TOTP code is invalid' },
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

export const PermissionException = {
  NotFound: new UnprocessableEntityException([
    { path: 'permissionId', code: 'ERROR.PERMISSION_NOT_FOUND', message: 'Permission is not exist' },
  ]),
  AlreadyExists: new UnprocessableEntityException([
    {
      path: 'path',
      code: 'ERROR.PERMISSION_ALREADY_EXISTS',
      message: 'Permission with this path and method already exists',
    },
  ]),
}

export const RoleException = {
  NotFound: new UnprocessableEntityException([
    { path: 'roleId', code: 'ERROR.ROLE_NOT_FOUND', message: 'Role is not exist' },
  ]),
  InvalidPermissionIds: (invalidPermissionIds?: number[]) =>
    new UnprocessableEntityException([
      {
        path: 'permissionIds',
        code: 'ERROR.ROLE_INVALID_PERMISSION_IDS',
        message: `Permission ids ${invalidPermissionIds?.join(', ') || ''} is invalid`,
        ...(invalidPermissionIds ? { invalidPermissionIds } : {}),
      },
    ]),
  AlreadyExists: new UnprocessableEntityException([
    { path: 'id', code: 'ERROR.ROLE_ALREADY_EXISTS', message: 'Role id already exists' },
  ]),
}
