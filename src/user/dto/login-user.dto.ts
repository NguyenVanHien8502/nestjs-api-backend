import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginUserDto {
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsString()
  email: string

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString()
  password: string
}
