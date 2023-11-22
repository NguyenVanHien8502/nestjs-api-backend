import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator'

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Username cannot be empty' })
  @IsString()
  username: string

  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail()
  email: string

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString()
  password: string

  @IsNotEmpty({ message: 'Please pick your role' })
  @IsString()
  role: string

  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Must be a valid Vietnamese phone number' })
  phone: string

  @IsOptional()
  @IsString()
  status: string
}
