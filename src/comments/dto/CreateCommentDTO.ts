import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateCommentDTO {
  @IsString()
  @IsNotEmpty()
  content: string

  @IsNumber()
  @IsNotEmpty()
  photoId: number
}
