import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDTO } from './dto/register.dto'
import { LoginDTO } from './dto/login.dto'
import { ResponseMessage } from 'src/common/decorator/response-message.decorator'
import { AuthGuard } from '@nestjs/passport'
import { User } from 'src/users/entities/user.entity'
import type { Request } from 'express'

type RefreshTokenDTO = {
  refreshToken: string
}
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ResponseMessage('Register successful')
  register(@Body() registerDTO: RegisterDTO) {
    return this.authService.register(registerDTO)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login successful')
  login(@Body() loginDTO: LoginDTO) {
    return this.authService.login(loginDTO)
  }

  @Post('refresh')
  @ResponseMessage('Get refresh token successful')
  @UseGuards(AuthGuard('jwt-refresh'))
  refresh(@Req() req: Request, @Body() refreshTokenDTO: RefreshTokenDTO) {
    const user = req.user as any
    return this.authService.createToken(user)
  }
}
