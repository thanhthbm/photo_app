import { Exclude } from 'class-transformer'
import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import * as bcrypt from 'bcrypt'

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
  createAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  async hashPassword() {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10)
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash)
  }
}
