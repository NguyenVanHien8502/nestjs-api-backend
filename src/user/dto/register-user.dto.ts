import { IsEmail, IsNotEmpty } from 'class-validator'

export class RegisterUserDto {
  @IsNotEmpty()
  username: string

  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string
}
