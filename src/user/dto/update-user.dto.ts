import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator'

export class UpdateUserDto {
  @IsNotEmpty({ message: 'Cannot be empty' })
  @IsString()
  username: string

  @IsPhoneNumber('VN', { message: 'Must be a valid Vietnamese phone number' })
  phone: string

  @IsNotEmpty({ message: 'Cannot be empty' })
  @IsString()
  role: string

  @IsString()
  status: string
}
