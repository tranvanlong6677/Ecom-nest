export interface AccessTokenPayload {
  userId: number;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: number;
  iat: number;
  exp: number;
}
