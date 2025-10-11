import {
  Body,
  Controller,
  DefaultValuePipe,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { PhotosService } from './photos.service'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { ResponseMessage } from 'src/common/decorator/response-message.decorator'

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file')) //file is the name field in form-data submitted
  uploadPhoto(
    @Request() req,
    @Body('title') title: string,
    @UploadedFile(
      //pipe to validate file
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 25 }), //25MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
        ]
      })
    )
    file: Express.Multer.File
  ) {
    return this.photosService.uploadPhoto(file, req.user.id, title)
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  @ResponseMessage('Fetch photos of a user')
  async getAllPhotos(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    console.log(1)
    return this.photosService.getAllPhotos(userId, { page, limit })
  }
}
