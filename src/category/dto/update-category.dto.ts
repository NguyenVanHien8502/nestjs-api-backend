import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  slug: string

  @IsNotEmpty()
  @IsString()
  status: string

  @IsString()
  desc: string
}
