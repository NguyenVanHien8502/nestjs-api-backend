import { IsNotEmpty, IsString, IsUrl } from 'class-validator'

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsString()
  slug: string

  @IsNotEmpty()
  @IsString()
  categories: string

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  link: string

  @IsString()
  status: string

  @IsString()
  desc: string
}
