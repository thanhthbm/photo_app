import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common'
import { catchError, map, Observable, throwError } from 'rxjs'
import { format } from 'date-fns'
import { Reflector } from '@nestjs/core'
import { RESPONSE_MESSAGE_METADATA } from '../decorator/response-message.decorator'

export type Response<T> = {
  status: boolean
  statusCode: number
  path: string
  message: string
  data: T
  timestamp: string
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context)),

      // ❗ Không tự res.json ở đây. Thay vào đó, chuẩn hoá lỗi rồi rethrow.
      catchError((err: unknown) => {
        const normalized = this.normalizeException(err as HttpException, context)
        return throwError(() => normalized)
      })
    )
  }

  // Biến mọi lỗi thành HttpException có body theo envelope của bạn (kèm errors nếu có)
  private normalizeException(exception: HttpException, context: ExecutionContext): HttpException {
    const ctx = context.switchToHttp()
    const req = ctx.getRequest()

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const payload = exception instanceof HttpException ? exception.getResponse() : null

    let message = 'Error'
    // errors có thể là string[], hoặc object theo từng field (từ exceptionFactory)
    let errors: string[] | Record<string, string[]> | undefined

    if (payload && typeof payload === 'object') {
      const p: any = payload
      // Ưu tiên errors dạng object (từng field)
      if (p.errors) errors = p.errors
      // Nếu không có, fallback vào mảng message mặc định của ValidationPipe
      else if (Array.isArray(p.message)) errors = p.message

      // Message tổng quát
      if (typeof p.message === 'string') message = p.message
      else if (Array.isArray(p.message)) message = p.message[0] ?? 'Bad Request'
      else if (typeof (exception as any).message === 'string') message = (exception as any).message
    } else if (typeof payload === 'string') {
      message = payload
    } else if (typeof (exception as any).message === 'string') {
      message = (exception as any).message
    }

    // Tạo body envelope chuẩn
    const body = {
      status: false,
      statusCode: status,
      path: req.url,
      message,
      ...(errors ? { errors } : {}), // <<-- giờ sẽ có `errors`
      data: null,
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    }

    // Ném lại HttpException mới với body đã chuẩn hoá
    return new HttpException(body, status)
  }

  private responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()
    const statusCode = response.statusCode
    const message = this.reflector.get<string>(RESPONSE_MESSAGE_METADATA, context.getHandler()) || 'success'

    return {
      status: true,
      path: request.url,
      statusCode,
      message,
      data: res,
      // date-fns cần Date, không phải ISO string
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    }
  }
}
