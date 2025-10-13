import { Comment } from 'src/comments/entities/comment.entity'
import { User } from 'src/users/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column({ nullable: true })
  description?: string

  @Column()
  secureUrl: string // url from cloudinary

  @Column()
  publicId: string //public id on cloudinary

  @Column()
  width: number

  @Column()
  height: number

  @OneToMany(() => Comment, (comment) => comment.photo)
  comments: Comment[]

  @ManyToOne(() => User)
  owner: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
