import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { PhotosModule } from 'src/photos/photos.module'
import { PhotosService } from 'src/photos/photos.service'

@Module({
  imports: [TypeOrmModule.forFeature([User]), PhotosModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
