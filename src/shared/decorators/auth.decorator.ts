import { SetMetadata } from '@nestjs/common'
import { AuthOptionsType, AuthType } from '../enums/auth-type.enum'

export const AUTH_TYPE_KEY = 'authType'

export type AuthOptionsType = (typeof AuthOptionsType)[keyof typeof AuthOptionsType]

export interface AuthOptions {
  condition?: AuthOptionsType
}

export const Auth = (authTypes: AuthType | AuthType[], options?: AuthOptions) =>
  SetMetadata(AUTH_TYPE_KEY, {
    authTypes: Array.isArray(authTypes) ? authTypes : [authTypes],
    condition: options?.condition ?? AuthOptionsType.AND,
  })
