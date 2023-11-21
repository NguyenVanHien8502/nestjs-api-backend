import { IsNotEmpty, IsString, IsUrl } from 'class-validator'

export class UpdateMovieDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  slug: string

  @IsNotEmpty()
  @IsString()
  categories: string

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  link: string

  @IsNotEmpty()
  @IsString()
  status: string

  @IsString()
  desc: string
}
