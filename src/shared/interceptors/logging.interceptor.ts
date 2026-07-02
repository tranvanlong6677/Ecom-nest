import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import type { Request, Response } from 'express'
import { Observable } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { throwError } from 'rxjs'
import * as requestIp from 'request-ip'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()
    const { method, url } = request
    const ip = requestIp.getClientIp(request) ?? 'unknown'
    const userAgent = request.headers['user-agent'] ?? 'unknown'
    const startTime = Date.now()

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime
        const statusCode = response.statusCode
        this.logger.log(`${method} ${url} ${statusCode} ${duration}ms — ${ip} "${userAgent}"`)
      }),
      catchError((error: unknown) => {
        const duration = Date.now() - startTime
        const statusCode = error?.['status'] ?? 500
        this.logger.error(`${method} ${url} ${statusCode} ${duration}ms — ${ip} "${userAgent}"`)
        return throwError(() => error)
      }),
    )
  }
}
