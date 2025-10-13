import { Exclude } from 'class-transformer'
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { Photo } from 'src/photos/entities/photo.entity'
import { Follow } from 'src/follows/entities/follow.entity'
import { Comment } from 'src/comments/entities/comment.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column()
  fullName: string

  @Column()
  @Exclude() //this would not return password hash in response
  passwordHash: string

  @Column({ nullable: true })
  avatarUrl: string

  @Column({ type: 'text', nullable: true })
  bio: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Exclude()
  @Column({ nullable: true })
  refreshToken: string

  @OneToMany(() => Photo, (photo) => photo.owner)
  photos: Photo[]

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[]

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[]

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[]

  @BeforeInsert()
  async hashPassword() {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10)
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash)
  }
}
