import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { BadRequestException, ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { ResponseInterceptor } from './common/interceptor/response.interceptor'
import { ValidationError } from 'class-validator'

function buildErrorMap(errors: ValidationError[], parentPath = ''): Record<string, string[]> {
  const map: Record<string, string[]> = {}

  for (const err of errors) {
    const path = parentPath ? `${parentPath}.${err.property}` : err.property

    if (err.constraints) {
      map[path] = Object.values(err.constraints)
    }

    // xử lý nested (children) nếu có
    if (err.children && err.children.length > 0) {
      const childMap = buildErrorMap(err.children, path)
      for (const [k, v] of Object.entries(childMap)) {
        map[k] = (map[k] ?? []).concat(v)
      }
    }
  }
  return map
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: false,
  validationError: {
    target: false, // không trả object gốc
    value: false   // không trả giá trị không hợp lệ
  },
  exceptionFactory: (validationErrors: ValidationError[] = []) => {
    const errors = buildErrorMap(validationErrors)
    // Chọn message tổng quát, phần chi tiết nằm trong `errors`
    return new BadRequestException({
      message: 'Validation failed',
      errors
    })
  }
}))
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)))
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  app.enableCors()
  await app.listen(3000)
}
bootstrap()
