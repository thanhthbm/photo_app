import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Repository } from 'typeorm'
import { CreateUserDTO } from './dto/create-user.dto'
import { Photo } from 'src/photos/entities/photo.entity'
import { PhotosService } from 'src/photos/photos.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly photosService: PhotosService
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ email })
  }

  async create(createUserDTO: CreateUserDTO): Promise<User> {
    const user = this.usersRepository.create({
      email: createUserDTO.email,
      fullName: createUserDTO.fullName,
      passwordHash: createUserDTO.password
    })

    return this.usersRepository.save(user)
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ id })
  }

  async getAllPhotos(userId: number): Promise<Photo[]> {
    const user = await this.usersRepository.findOneBy({ id: userId })
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    return this.photosService.getAllPhotos(userId)
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    const refreshTokenHashed = await bcrypt.hash(refreshToken, 10)
    await this.usersRepository.update(id, {
      refreshToken: refreshTokenHashed
    })
  }

  async validateRefreshToken(userId: number, refreshToken: string): Promise<User | null> {
    const user = await this.findById(userId)

    if (!user || !user.refreshToken) {
      return null
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken)
    return isMatch ? user : null
  }
}
