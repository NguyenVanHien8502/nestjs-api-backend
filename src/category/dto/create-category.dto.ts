import { IsNotEmpty } from 'class-validator'

export class CreateCategoryDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  status: string

  desc: string
}
