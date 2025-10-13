import { CreateCommentDTO } from './dto/CreateCommentDTO'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/users/entities/user.entity'
import { Repository } from 'typeorm'
import { Comment } from './entities/comment.entity'

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>
  ) {}

  async createComment(createCommentDTO: CreateCommentDTO, author: User) {
    const newComment = this.commentsRepository.create({
      content: createCommentDTO.content,
      author: author,
      photo: { id: createCommentDTO.photoId }
    })
    return this.commentsRepository.save(newComment)
  }

  async findCommentByPhotoId(photoId: number) {
    return this.commentsRepository.find({
      where: {
        photo: { id: photoId }
      },
      relations: {
        author: true
      },
      order: {
        createdAt: 'ASC'
      }
    })
  }
}
