import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator'

export interface Response<T> {
  data: T
  statusCode: number
  message: string
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [context.getHandler(), context.getClass()]) ??
      'Success'

    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse()
        return {
          data,
          statusCode: response.statusCode,
          message,
        }
      }),
    )
  }
}
