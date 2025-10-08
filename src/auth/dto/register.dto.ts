import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class RegisterDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  fullName: string

  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long'
  })
  password: string
}
