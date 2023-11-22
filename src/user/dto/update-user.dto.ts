import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator'

export class UpdateUserDto {
  @IsNotEmpty({ message: 'Username cannot be empty' })
  @IsString()
  username: string

  @IsPhoneNumber('VN', { message: 'Must be a valid Vietnamese phone number' })
  phone: string

  @IsNotEmpty({ message: 'Please pick your role' })
  @IsString()
  role: string

  @IsString()
  status: string
}
