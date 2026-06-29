export enum AuthType {
  Bearer = 'Bearer',
  APIKey = 'APIKey',
  None = 'None',
}

export const AuthOptionsType = {
  AND: 'and',
  OR: 'or',
} as const
