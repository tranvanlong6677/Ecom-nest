export interface AccessTokenCreateType {
  userId: number
  roleId: number
  roleName: string
  deviceId: number
}

export interface AccessTokenPayload extends AccessTokenCreateType {
  exp: number
  iat: number
}

export interface RefreshTokenCreateType {
  userId: number
}

export interface RefreshTokenPayload extends RefreshTokenCreateType {
  exp: number
  iat: number
}
