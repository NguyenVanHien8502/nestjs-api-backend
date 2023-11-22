import { IsNotEmpty, IsString } from 'class-validator'

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString()
  name: string

  @IsString()
  slug: string

  @IsString()
  status: string

  @IsString()
  desc: string
}
