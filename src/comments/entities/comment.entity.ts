import { Photo } from 'src/photos/entities/photo.entity'
import { User } from 'src/users/entities/user.entity'
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'text' })
  content: string

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE'
  })
  author: User

  @ManyToOne(() => Photo, (photo) => photo.comments, {
    onDelete: 'CASCADE'
  })
  photo: Photo

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
