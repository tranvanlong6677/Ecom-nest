import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import type { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const statusCode = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as any).message ?? 'Something went wrong')

    response.status(statusCode).json({
      data: null,
      statusCode,
      message,
    })
  }
}
