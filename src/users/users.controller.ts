import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { AuthGuard } from '@nestjs/passport'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id)
    delete user.passwordHash
    return user
  }
}
