import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { isUniqueConstraintPrismaError } from '@/shared/helper'

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR
    let message: unknown = 'Internal server error'

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus()
      const response = exception.getResponse()
      if (typeof response === 'string') {
        message = response
      } else if (typeof response === 'object' && response !== null) {
        message = (response as Record<string, unknown>)['message'] ?? exception.message
      }
    }

    if (isUniqueConstraintPrismaError(exception)) {
      httpStatus = HttpStatus.CONFLICT
      message = 'Unique constraint failed'
    }

    const responseBody = {
      statusCode: httpStatus,
      message,
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}
