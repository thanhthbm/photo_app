import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common'
import { CommentsService } from './comments.service'
import { AuthGuard } from '@nestjs/passport'
import { CreateCommentDTO } from './dto/CreateCommentDTO'

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() createCommentDTO: CreateCommentDTO) {
    const user = req.user
    return this.commentsService.createComment(createCommentDTO, user)
  }

  @Get('photo/:photoId')
  @UseGuards(AuthGuard('jwt'))
  findByPhotoId(@Param('photoId', ParseIntPipe) photoId: number) {
    return this.commentsService.findCommentByPhotoId(photoId)
  }
}
