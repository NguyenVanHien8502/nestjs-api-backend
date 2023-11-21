import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator'

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Cannot be empty' })
  @IsString()
  username: string

  @IsNotEmpty({ message: 'Cannot be empty' })
  @IsEmail()
  email: string

  @IsNotEmpty({ message: 'Cannot be empty' })
  @IsString()
  password: string

  @IsNotEmpty({ message: 'Cannot be empty' })
  @IsString()
  role: string

  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Must be a valid Vietnamese phone number' })
  phone: string

  @IsOptional()
  @IsString()
  status: string
}
