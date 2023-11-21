import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginUserDto {
  @IsNotEmpty({ message: 'Cannot be empty' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsString()
  email: string

  @IsNotEmpty({ message: 'Cannot be empty' })
  @IsString()
  password: string
}
