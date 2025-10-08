import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  secureUrl: string; // url from cloudinary

  @Column()
  publicId: string; //public id on cloudinary

  @Column()
  width: number;

  @Column()
  height: number;

  @ManyToOne(() => User)
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}