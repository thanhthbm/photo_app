import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class RegisterDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(160)
  fullName: string

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(160)
  password: string
}
