import { IsNotEmpty } from 'class-validator'

export class CreateMovieDto {
  @IsNotEmpty()
  name: string

  slug: string

  @IsNotEmpty()
  category: string

  link: string

  @IsNotEmpty()
  status: string

  desc: string
}
