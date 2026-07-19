export enum AuthType {
  Bearer = 'Bearer',
  PaymentAPIKey = 'PaymentAPIKey',
  None = 'None',
}

export const AuthOptionsType = {
  AND: 'and',
  OR: 'or',
} as const
