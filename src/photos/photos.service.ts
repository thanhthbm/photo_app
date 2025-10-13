import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Photo } from './entities/photo.entity'
import { FindManyOptions, Repository } from 'typeorm'
import { v2 as cloudinary, UploadApiResponse, UploadStream } from 'cloudinary'
import { User } from 'src/users/entities/user.entity'
import { CLOUDINARY } from 'src/cloudinary/cloudinary.provider'

interface PaginationOptions {
  page: number
  limit: number
}
@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,

    @Inject(CLOUDINARY)
    private cloudinary
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
      owner: {
        id: userId
      } as User
    })

    return this.photosRepository.save(newPhoto)
  }

  async findById(photoId: number) {
    return this.photosRepository.findOne({
      where: {
        id: photoId
      },
      relations: {
        owner: true,
        comments: {
          author: true
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        secureUrl: true,
        publicId: true,
        width: true,
        height: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true
        },
        comments: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            id: true,
            fullName: true,
            avatarUrl: true
          }
        }
      },
      order: {
        comments: {
          createdAt: 'ASC'
        }
      }
    })
  }

  //handle get all photo of a user
  async getAllPhotos(userId: number, options: PaginationOptions) {
    const { page, limit } = options
    const skip = limit * (page - 1)

    const findOptions: FindManyOptions = {
      where: {
        owner: {
          id: userId
        }
      },
      relations: {
        owner: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        secureUrl: true,
        publicId: true,
        width: true,
        height: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true
        }
      },
      skip: skip,
      take: limit,
      order: {
        createdAt: 'DESC'
      }
    }

    const [data, total] = await Promise.all([
      this.photosRepository.find(findOptions),
      this.photosRepository.count({ where: { owner: { id: userId } } })
    ])

    const hasNextPage: boolean = skip + data.length < total
    return {
      data,
      total,
      currentPage: page,
      hasNextPage
    }
  }
}
