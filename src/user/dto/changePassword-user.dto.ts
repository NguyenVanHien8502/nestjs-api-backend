import { IsNotEmpty, IsString } from 'class-validator'

export class ChangePasswordUserDto {
  @IsNotEmpty({ message: 'CurrentPassword cannot be empty' })
  @IsString()
  currentPassword: string

  @IsNotEmpty({ message: 'Please fill in new Password' })
  @IsString()
  newPassword: string

  @IsNotEmpty({ message: 'Please confirm new Password' })
  @IsString()
  confirmPassword: string
}
