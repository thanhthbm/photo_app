import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Repository } from 'typeorm'
import { CreateUserDTO } from './dto/create-user.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
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
}
