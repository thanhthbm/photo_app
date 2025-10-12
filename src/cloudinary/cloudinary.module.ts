import { Module } from '@nestjs/common'
import { CLOUDINARY, CloudinaryProvider } from './cloudinary.provider'

@Module({
  providers: [CloudinaryProvider],
  exports: [CLOUDINARY]
})
export class CloudinaryModule {}
