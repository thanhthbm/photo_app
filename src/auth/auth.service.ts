import { JwtService } from '@nestjs/jwt'
import { UsersService } from './../users/users.service'
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { RegisterDTO } from './dto/register.dto'
import { CreateUserDTO } from 'src/users/dto/create-user.dto'
import { LoginDTO } from './dto/login.dto'
import { User } from 'src/users/entities/user.entity'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDTO: RegisterDTO) {
    const existingUser = await this.usersService.findByEmail(registerDTO.email)
    if (existingUser) {
      throw new ConflictException('Email already exist')
    }

    const createUserDTO: CreateUserDTO = {
      email: registerDTO.email,
      fullName: registerDTO.fullName,
      password: registerDTO.password
    }

    const user = await this.usersService.create(createUserDTO)

    delete user.passwordHash

    await this.createToken(user)

    delete user.refreshToken

    return user
  }

  async login(
    loginDTO: LoginDTO
  ): Promise<{ accessToken: string; refreshToken?: string } & { user: Omit<User, 'passwordHash'> }> {
    const user = await this.usersService.findByEmail(loginDTO.email)

    if (!user || !(await user.validatePassword(loginDTO.password))) {
      throw new UnauthorizedException('Invalid credentials')
    }

    if (!user.refreshToken) {
      const { accessToken, refreshToken } = await this.createToken(user)
      const safeUser = { ...(user as any) }
      delete safeUser.passwordHash
      delete user.refreshToken
      return { accessToken, refreshToken, user: safeUser }
    }

    const payload = {
      sub: user.id,
      email: user.email
    }

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: user.refreshToken,
      user: user
    }
  }

  async createToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN')
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN')
      })
    ])

    this.usersService.updateRefreshToken(user.id, refreshToken)

    return { accessToken, refreshToken }
  }
}
