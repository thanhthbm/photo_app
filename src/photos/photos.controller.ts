import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { PhotosService } from './photos.service'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'

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
}
