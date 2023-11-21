import { IsNotEmpty, IsString } from 'class-validator'

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsString()
  slug: string

  @IsString()
  status: string

  @IsString()
  desc: string
}
