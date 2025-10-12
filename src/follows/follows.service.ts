import { UsersService } from './../users/users.service'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Follow } from './entities/follow.entity'
import { Repository } from 'typeorm'

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
    private readonly UsersService: UsersService
  ) {}

  async followUser(followerId: number, followingId: number): Promise<Follow> {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself.')
    }

    const userToFollow = this.UsersService.findById(followingId)

    if (!userToFollow) {
      throw new NotFoundException(`User with ID ${followingId} not found.`)
    }

    const existingFollow = await this.followsRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId }
      }
    })

    if (existingFollow) {
      throw new BadRequestException('You have already followed this user.')
    }

    const follow = this.followsRepository.create({
      follower: { id: followerId },
      following: { id: followingId }
    })

    return this.followsRepository.save(follow)
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    const follow = await this.followsRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId }
      }
    })

    if (follow) {
      await this.followsRepository.delete(follow)
      return
    }

    throw new NotFoundException('Follow relationship not found.')
  }

  async getFollowers(userId: number): Promise<Follow[]> {
    return this.followsRepository.find({
      where: {
        following: { id: userId }
      },
      relations: ['follower']
    })
  }

  async getFollowing(userId: number): Promise<Follow[]> {
    return this.followsRepository.find({
      where: {
        follower: { id: userId }
      },
      relations: ['following']
    })
  }
}
