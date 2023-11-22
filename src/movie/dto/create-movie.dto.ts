import { IsNotEmpty, IsString, IsUrl } from 'class-validator'

export class CreateMovieDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString()
  name: string

  @IsString()
  slug: string

  @IsNotEmpty({ message: 'Category cannot be empty' })
  // @IsString()
  categories: string[]

  @IsNotEmpty({ message: 'Link movie cannot be empty' })
  @IsString()
  @IsUrl()
  link: string

  @IsString()
  status: string

  @IsString()
  desc: string
}
