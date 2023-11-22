import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateCategoryDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString()
  name: string

  @IsNotEmpty({ message: 'Slug cannot be empty' })
  @IsString()
  slug: string

  @IsNotEmpty({ message: 'Status cannot be empty' })
  @IsString()
  status: string

  @IsString()
  desc: string
}
