import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'

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
  NewPasswordAndCurrentPasswordAreTheSame: new UnprocessableEntityException([
    {
      path: 'newPassword',
      code: 'ERROR.NEW_PASSWORD_AND_CURRENT_PASSWORD_ARE_THE_SAME',
      message: 'New password and current password must be different',
    },
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
  NotBeDeleted: new UnprocessableEntityException([
    { path: 'userId', code: 'ERROR.USER_NOT_BE_DELETED', message: 'User cannot be deleted' },
  ]),
  CannotUpdateOrDeleteYourself: new ForbiddenException([
    {
      path: 'userId',
      code: 'ERROR.USER_CANNOT_UPDATE_OR_DELETE_YOURSELF',
      message: 'You cannot update or delete yourself',
    },
  ]),
  CannotSetAdminRole: new ForbiddenException([
    { path: 'roleId', code: 'ERROR.USER_CANNOT_SET_ADMIN_ROLE', message: 'Only Admin can assign the Admin role' },
  ]),
  CannotUpdateOrDeleteAdmin: new ForbiddenException([
    {
      path: 'userId',
      code: 'ERROR.USER_CANNOT_UPDATE_OR_DELETE_ADMIN',
      message: 'Only Admin can update or delete an Admin user',
    },
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

export const BrandException = {
  NotFound: new UnprocessableEntityException([
    { path: 'brandId', code: 'ERROR.BRAND_NOT_FOUND', message: 'Brand is not exist' },
  ]),
}

export const BrandTranslationException = {
  NotFound: new UnprocessableEntityException([
    {
      path: 'brandTranslationId',
      code: 'ERROR.BRAND_TRANSLATION_NOT_FOUND',
      message: 'Brand translation is not exist',
    },
  ]),
  AlreadyExists: new UnprocessableEntityException([
    {
      path: 'languageId',
      code: 'ERROR.BRAND_TRANSLATION_ALREADY_EXISTS',
      message: 'Brand translation for this language already exists',
    },
  ]),
  InvalidBrandOrLanguage: new UnprocessableEntityException([
    {
      path: 'brandId',
      code: 'ERROR.BRAND_TRANSLATION_INVALID_BRAND_OR_LANGUAGE',
      message: 'Brand or language is not exist',
    },
  ]),
}

export const CategoryException = {
  NotFound: new UnprocessableEntityException([
    { path: 'categoryId', code: 'ERROR.CATEGORY_NOT_FOUND', message: 'Category is not exist' },
  ]),
  ParentCategoryNotFound: new UnprocessableEntityException([
    {
      path: 'parentCategoryId',
      code: 'ERROR.PARENT_CATEGORY_NOT_FOUND',
      message: 'Parent category is not exist',
    },
  ]),
}

export const CategoryTranslationException = {
  NotFound: new UnprocessableEntityException([
    {
      path: 'categoryTranslationId',
      code: 'ERROR.CATEGORY_TRANSLATION_NOT_FOUND',
      message: 'Category translation is not exist',
    },
  ]),
  AlreadyExists: new UnprocessableEntityException([
    {
      path: 'languageId',
      code: 'ERROR.CATEGORY_TRANSLATION_ALREADY_EXISTS',
      message: 'Category translation for this language already exists',
    },
  ]),
  InvalidCategoryOrLanguage: new UnprocessableEntityException([
    {
      path: 'categoryId',
      code: 'ERROR.CATEGORY_TRANSLATION_INVALID_CATEGORY_OR_LANGUAGE',
      message: 'Category or language is not exist',
    },
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

export const ProductException = {
  NotFound: new UnprocessableEntityException([
    { path: 'productId', code: 'ERROR.PRODUCT_NOT_FOUND', message: 'Product is not exist' },
  ]),
  InvalidBrand: new UnprocessableEntityException([
    { path: 'brandId', code: 'ERROR.PRODUCT_INVALID_BRAND', message: 'Brand is not exist' },
  ]),
  InvalidCategory: new UnprocessableEntityException([
    {
      path: 'categories',
      code: 'ERROR.PRODUCT_INVALID_CATEGORY',
      message: 'One or more categories are not exist',
    },
  ]),
  Forbidden: new ForbiddenException([
    {
      path: 'productId',
      code: 'ERROR.PRODUCT_FORBIDDEN',
      message: 'You do not have permission to manage this product',
    },
  ]),
}

export const CartException = {
  NotFoundSKU: new NotFoundException([
    { path: 'skuId', code: 'ERROR.CART_SKU_NOT_FOUND', message: 'SKU is not exist' },
  ]),
  OutOfStockSKU: new BadRequestException([
    { path: 'skuId', code: 'ERROR.CART_SKU_OUT_OF_STOCK', message: 'SKU is out of stock' },
  ]),
  ProductNotFound: new NotFoundException([
    { path: 'productId', code: 'ERROR.CART_PRODUCT_NOT_FOUND', message: 'Product is not exist' },
  ]),
  NotFoundCartItem: new NotFoundException([
    { path: 'cartItemId', code: 'ERROR.CART_ITEM_NOT_FOUND', message: 'Cart item is not exist' },
  ]),
}

export const ProductTranslationException = {
  NotFound: new UnprocessableEntityException([
    {
      path: 'productTranslationId',
      code: 'ERROR.PRODUCT_TRANSLATION_NOT_FOUND',
      message: 'Product translation is not exist',
    },
  ]),
  AlreadyExists: new UnprocessableEntityException([
    {
      path: 'languageId',
      code: 'ERROR.PRODUCT_TRANSLATION_ALREADY_EXISTS',
      message: 'Product translation for this language already exists',
    },
  ]),
  InvalidProductOrLanguage: new UnprocessableEntityException([
    {
      path: 'productId',
      code: 'ERROR.PRODUCT_TRANSLATION_INVALID_PRODUCT_OR_LANGUAGE',
      message: 'Product or language is not exist',
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

  BaseRoleCannotBeDeleted: new UnprocessableEntityException([
    { path: 'id', code: 'ERROR.ROLE_BASE_ROLE_CANNOT_BE_DELETED', message: 'Base role cannot be deleted' },
  ]),

  AdminCannotBeUpdated: new UnprocessableEntityException([
    { path: 'id', code: 'ERROR.ROLE_ADMIN_CANNOT_BE_UPDATED', message: 'Admin role cannot be updated' },
  ]),
}

export const PaymentException = {
  CannotGetPaymentId: new BadRequestException('Cannot get payment id information'),
  NotFoundPayment: new NotFoundException('Payment is not exist'),
  TotalPriceNotMatch: new BadRequestException('Total price is not match'),
}
