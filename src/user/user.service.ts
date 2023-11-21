import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from './user.schema'
import { JwtService } from '@nestjs/jwt'
import { RegisterUserDto } from './dto/register-user.dto'
import { Request, Response } from 'express'
import { LoginUserDto } from './dto/login-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { ChangePasswordUserDto } from './dto/changePassword-user.dto'
import { roleUser, statusUser } from '../utils/variableGlobal'

@Injectable()
export class UserService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    try {
      const { email, password, username, role, status, phone } = registerUserDto
      const findUser = await this.userModel.findOne({ email: email })
      if (findUser) {
        return {
          msg: 'This email already exists',
          status: false,
        }
      }
      if (username !== '' && username.length < 2) {
        return {
          msg: 'Username should be least 2 characters',
          status: false,
        }
      }
      if (password !== '' && password.length < 4) {
        return {
          msg: 'Password should be least 4 characters',
          status: false,
        }
      }
      if (role !== roleUser.user && role !== roleUser.admin) {
        return {
          msg: `Value of role must be ${roleUser.user} or ${roleUser.admin}`,
          status: false,
        }
      }

      const newUser = await this.userModel.create({
        username: username,
        email: email,
        password: password,
        phone: phone,
        role: role,
        status: status,
      })
      return {
        msg: 'Registered Successfully',
        status: true,
        newUser: newUser,
      }
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  async loginUser(loginUserDto: LoginUserDto, res: Response): Promise<any> {
    try {
      const { email, password } = loginUserDto
      const user = await this.userModel.findOne({ email: email })
      if (!user) {
        return {
          msg: 'Not exist this email',
          status: false,
        }
      }
      if (user && !(await user.isMatchedPassword(password))) {
        return {
          msg: 'Password information is incorrect',
          status: false,
        }
      }

      const payload = {
        _id: user._id,
        role: user.role,
      }
      const payload1 = {
        _id: user._id,
        username: user.username,
      }

      const refreshToken = await this.jwtService.signAsync(payload1, {
        expiresIn: '3d',
      })

      await this.userModel.findByIdAndUpdate(
        user._id,
        {
          refreshToken: refreshToken,
        },
        {
          new: true,
        },
      )
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      })

      return {
        msg: 'Login Successfully',
        status: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          token: await this.jwtService.signAsync(payload),
        },
      }
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  async loginAdmin(loginUserDto: LoginUserDto, res: Response): Promise<any> {
    try {
      const { email, password } = loginUserDto
      const user = await this.userModel.findOne({ email: email })
      if (!user) {
        return {
          msg: 'Not exist this email',
          status: false,
        }
      }

      if (user && !(await user.isMatchedPassword(password))) {
        return {
          msg: 'Password information is incorrect',
          status: false,
        }
      }

      if (user && user.role !== 'admin') {
        return {
          msg: 'You are not an admin',
          status: false,
        }
      }

      const payload = {
        _id: user._id,
        role: user.role,
      }
      const payload1 = {
        _id: user._id,
        username: user.username,
      }

      const refreshToken = await this.jwtService.signAsync(payload1, {
        expiresIn: '3d',
      })

      await this.userModel.findByIdAndUpdate(
        user._id,
        {
          refreshToken: refreshToken,
        },
        {
          new: true,
        },
      )
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      })

      return {
        msg: 'Login Successfully',
        status: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          token: await this.jwtService.signAsync(payload),
        },
      }
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  async handleRefreshToken(refreshToken: string) {
    try {
      const findUser = await this.userModel.findOne({
        refreshToken: refreshToken,
      })
      if (!findUser) {
        return new UnauthorizedException('Not authorization')
      }
      const decoded = this.jwtService.decode(refreshToken) as any
      if (decoded.exp < new Date().getTime() / 1000) {
        // refreshToken hết hạn
        return new ForbiddenException(
          'Refresh Token is expired or error. Please login again',
        )
      } else {
        //refreshToken còn hạn
        const payload = {
          _id: findUser._id,
          role: findUser.role,
        }
        const newToken = await this.jwtService.signAsync(payload)
        return {
          newToken: newToken,
        }
      }
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  async changePassword(
    changePasswordUserDto: ChangePasswordUserDto,
    currentUserId: object,
  ) {
    const { currentPassword, newPassword, confirmPassword } =
      changePasswordUserDto
    try {
      const user = await this.userModel.findById(currentUserId)
      if (!user) {
        return {
          msg: 'Not exists this user',
          status: false,
        }
      }

      if (!(await user.isMatchedPassword(currentPassword))) {
        return {
          msg: 'You have entered your current password incorrectly',
          status: false,
        }
      }

      if (newPassword !== confirmPassword) {
        return {
          msg: 'New password and confirm password must be the same',
          status: false,
        }
      }

      if (newPassword !== '' && newPassword.length < 4) {
        return {
          msg: 'Password should be least 4 characters',
          status: false,
        }
      }

      if (currentPassword === newPassword) {
        return {
          msg: 'The old and new passwords must be different',
          status: false,
        }
      }

      user.password = newPassword
      await user.save()
      return {
        msg: 'Change password successfully',
        status: true,
      }
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  async getAllUser(
    keySearch?: string,
    currentPage?: number,
    itemsPerPage?: number,
  ) {
    try {
      let options = {}

      if (keySearch) {
        options = {
          $or: [
            { username: new RegExp(keySearch.toString(), 'i') },
            { email: new RegExp(keySearch.toString(), 'i') },
          ],
        }
      }

      const users = this.userModel.find(options)

      const page: number = currentPage || 1
      const limit: number = itemsPerPage || 100
      const skip: number = (page - 1) * limit

      const totalUsers = await this.userModel.count(options)
      const data = await users.skip(skip).limit(limit).exec()

      return {
        data,
        status: true,
        totalUsers,
        page,
        limit,
      }
    } catch (error) {
      throw new NotFoundException(error)
    }
  }

  async getaUser(userId: any) {
    try {
      const user = await this.userModel.findById(userId)
      if (!user) {
        return {
          msg: 'Not exist this user',
          status: false,
        }
      }
      return user
    } catch (error) {
      throw new NotFoundException(error)
    }
  }

  async updateUser(userId: any, updateUserDto: UpdateUserDto) {
    try {
      const { username, phone, role, status } = updateUserDto

      const findUser = await this.userModel.findById(userId)
      if (!findUser) {
        return {
          msg: 'Not found this user',
          status: false,
        }
      }

      if (username && username.length < 2) {
        return {
          msg: 'Username should be least 2 characters',
          status: false,
        }
      }

      //check value role
      if (role !== roleUser.user && role !== roleUser.admin) {
        return {
          msg: `Value of role must be ${roleUser.user} or ${roleUser.admin}`,
          status: false,
        }
      }

      //check value status
      if (status) {
        if (
          status !== statusUser.alone &&
          status !== statusUser.adult &&
          status !== statusUser.tretrow &&
          status !== statusUser.married
        ) {
          return {
            msg: `Value of status must be ${statusUser.alone} or ${statusUser.adult} or ${statusUser.tretrow} or ${statusUser.married}`,
            status: false,
          }
        }
      }
      const updateUser = await this.userModel.findByIdAndUpdate(
        userId,
        {
          username: username,
          phone: phone,
          role: role,
          status: status,
        },
        {
          new: true,
        },
      )
      return {
        msg: 'Updated User Successfully',
        status: true,
        updateUser: updateUser,
      }
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  async deleteUser(userId: any) {
    try {
      const findUser = await this.userModel.findById(userId)
      if (!findUser) {
        return {
          msg: 'Not found this user',
          status: false,
        }
      } else {
        const deleteUser = await this.userModel.findByIdAndDelete(userId)
        return {
          msg: 'Deleted User Successfully',
          status: true,
          deleteUser: deleteUser,
        }
      }
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  async deleteManyUser(req: Request) {
    try {
      const { userIds } = req.body
      userIds?.forEach(async (userId) => {
        const findUser = await this.userModel.findById(userId)
        if (!findUser) {
          return {
            msg: `User ${userId} is not exists`,
            status: false,
          }
        }
      })
      const deletedManyUser = await this.userModel.deleteMany({
        _id: { $in: userIds },
      })
      return {
        msg: 'Deleted Users Successfully',
        status: true,
        deletedManyUser: deletedManyUser,
      }
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  //  function tong(a, b, callback ) {
  //   console.log('Tong: ' + (a + b));
  //   return callback(a + b);
  //   }
  //   var tinh_tong = tong(3, 5, function (sum) {
  //     console.log("2");
  //     return sum+2;
  //     })
  //   alert(tinh_tong);
}
