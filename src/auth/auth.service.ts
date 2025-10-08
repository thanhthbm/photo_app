import { JwtService } from '@nestjs/jwt'
import { UsersService } from './../users/users.service'
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { RegisterDTO } from './dto/register.dto'
import { CreateUserDTO } from 'src/users/dto/create-user.dto'
import { LoginDTO } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private UsersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(registerDTO: RegisterDTO) {
    const existingUser = await this.UsersService.findByEmail(registerDTO.email)
    if (existingUser) {
      throw new ConflictException('Email already exist')
    }

    const createUserDTO: CreateUserDTO = {
      email: registerDTO.email,
      fullName: registerDTO.fullName,
      password: registerDTO.password
    }

    const user = await this.UsersService.create(createUserDTO)

    delete user.passwordHash
    return user
  }

  async login(loginDTO: LoginDTO): Promise<{ accessToken: string }> {
    const user = await this.UsersService.findByEmail(loginDTO.email)

    if (!user || !(await user.validatePassword(loginDTO.password))) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const payload = {
      sub: user.id,
      email: user.email
    }

    return {
      accessToken: this.jwtService.sign(payload)
    }
  }
}
