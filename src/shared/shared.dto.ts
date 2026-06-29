export class SuccessResDto {
  statusCode: string
  data: any
  constructor(partial: Partial<SuccessResDto>) {
    Object.assign(this, partial)
  }
}
