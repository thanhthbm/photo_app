import { User } from "src/users/entities/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('follows')
@Unique(['follower', 'following'])
export class Follow{
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, (user) => user.following, {eager: true})
  follower: User

  @ManyToOne(() => User, (user) => user.followers, {eager: true})
  following: User
}