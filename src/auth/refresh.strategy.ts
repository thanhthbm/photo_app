import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersService } from 'src/users/users.service'
@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request.body.refreshToken
        },
        (request: Request) => request.cookies?.refresh_token
      ]),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true
    })
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req?.body?.refreshToken || req?.cookies?.refresh_token
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token')

    const user = await this.usersService.validateRefreshToken(payload.sub, refreshToken)
    if (!user) throw new UnauthorizedException('Invalid refresh token')

    return user
  }
}
