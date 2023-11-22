import { IsNotEmpty, IsString, IsUrl } from 'class-validator'

export class UpdateMovieDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString()
  name: string

  @IsNotEmpty({ message: 'Slug cannot be empty' })
  @IsString()
  slug: string

  @IsNotEmpty({ message: 'Category cannot be empty' })
  // @IsString()
  categories: string[]

  @IsNotEmpty({ message: 'Link movie cannot be empty' })
  @IsString()
  @IsUrl()
  link: string

  @IsNotEmpty({ message: 'Status cannot be empty' })
  @IsString()
  status: string

  @IsString()
  desc: string
}
