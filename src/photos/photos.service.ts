import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Photo } from './entities/photo.entity'
import { Repository } from 'typeorm'
import { v2 as cloudinary, UploadApiResponse, UploadStream } from 'cloudinary'
import { User } from 'src/users/entities/user.entity'

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>
  ) {}

  async uploadPhoto(file: Express.Multer.File, userId: number, title: string) {
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
        if (error) return reject(error)
        resolve(result)
      })
      uploadStream.end(file.buffer)
    })

    const newPhoto = this.photosRepository.create({
      title,
      secureUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      owner: { id: userId } as User
    })

    return this.photosRepository.save(newPhoto)
  }

  //handle get all photo of a user
  async getAllPhotos(userId: number): Promise<Photo[]> {
    return this.photosRepository.find({
      where: {
        owner: { id: userId }
      }
    })
  }
}
