import { Controller, Delete, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common'
import { FollowsService } from './follows.service'
import { ResponseMessage } from 'src/common/decorator/response-message.decorator'
import { AuthGuard } from '@nestjs/passport'

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':id/follow')
  @ResponseMessage('User followed successfully')
  followUser(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const followerId = parseInt(req.user.id)
    return this.followsService.followUser(followerId, id)
  }

  @Delete(':id/unfollow')
  @ResponseMessage('User unfollowed successfully')
  unfollowUser(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const followerId = parseInt(req.user.id)
    return this.followsService.unfollowUser(followerId, id)
  }

  @Get(':id/followers')
  @ResponseMessage(`Fetched user's followers`)
  getFollowers(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.followsService.getFollowers(id)
  }

  @Get(':id/following')
  @ResponseMessage("Fetched user's following list")
  getFollowing(@Param('id', ParseIntPipe) id: number) {
    return this.followsService.getFollowing(id)
  }
}
