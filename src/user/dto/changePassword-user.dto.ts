import { IsNotEmpty, IsString } from 'class-validator'

export class ChangePasswordUserDto {
  @IsNotEmpty({ message: 'Cannot be empty' })
  @IsString()
  currentPassword: string

  @IsNotEmpty({ message: 'Cannot be empty' })
  @IsString()
  newPassword: string

  @IsNotEmpty({ message: 'Cannot be empty' })
  @IsString()
  confirmPassword: string
}
