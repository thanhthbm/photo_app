import { forwardRef, Module } from '@nestjs/common'
import { PhotosController } from './photos.controller'
import { PhotosService } from './photos.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Photo } from './entities/photo.entity'
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([Photo]), CloudinaryModule, forwardRef(() => UsersModule)],
  controllers: [PhotosController],
  providers: [PhotosService],
  exports: [PhotosService]
})
export class PhotosModule {}
