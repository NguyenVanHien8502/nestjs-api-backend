import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from './user.model'
import { JwtService } from '@nestjs/jwt'
import { RegisterUserDto } from './dto/register-user.dto'
import { Response } from 'express'
import { LoginUserDto } from './dto/login-user.dto'

@Injectable()
export class UserService {
  private users: User[] = []
  constructor(
    private jwtService: JwtService,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}
  async register(registerUserDto: RegisterUserDto) {
    const { email } = registerUserDto
    // const newUser = new this.userModel({
    //   username: username,
    //   email: email,
    //   password: password,
    //   age: age,
    // })
    // const result = await newUser.save()
    const findUser = await this.userModel.findOne({ email: email })
    if (findUser)
      return {
        msg: 'This email already exists',
        status: false,
      }
    const newUser = await this.userModel.create({
      username: registerUserDto.username,
      email: registerUserDto.email,
      password: registerUserDto.password,
      age: registerUserDto.age,
    })
    return {
      msg: 'Register Successfully',
      status: true,
      newUser: newUser,
    }
  }

  async loginUser(loginUserDto: LoginUserDto, res: Response): Promise<any> {
    const { email, password } = loginUserDto
    const user: User = await this.userModel.findOne({ email: email })
    if (!user || !(await user.isMatchedPassword(password))) {
      return new UnauthorizedException('Email or Password is incorrect')
    }

    const payload = {
      _id: user._id,
      age: user.age,
    }
    const payload1 = {
      _id: user._id,
      username: user.username,
    }

    const refreshToken = await this.jwtService.signAsync(payload1, {
      expiresIn: '3h',
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
      maxAge: 3 * 60 * 60 * 1000,
    })

    return {
      msg: 'Login Successfully',
      status: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        age: user.age,
        cart: user.cart,
        token: await this.jwtService.signAsync(payload),
      },
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
          age: findUser.age,
        }
        const newToken = await this.jwtService.signAsync(payload)
        return {
          newToken: newToken,
        }
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async getAllUser() {
    try {
      const allUsers = await this.userModel.find().exec()
      return allUsers as User[]
    } catch (error) {
      throw new Error(error)
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
      throw new Error(error)
    }
  }

  async updateUser(userId: any, username: string, age: number) {
    try {
      const findUser = await this.userModel.findById(userId)
      if (!findUser) {
        return {
          msg: 'Not found this user',
          status: false,
        }
      }
      const updateUser = await this.userModel.findByIdAndUpdate(
        userId,
        {
          username: username,
          age: age,
        },
        {
          new: true,
        },
      )
      return {
        msg: 'Update User Successfully',
        status: true,
        updateUser: updateUser,
      }
    } catch (error) {
      throw new Error(error)
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
          msg: 'Delete User Successfully',
          status: true,
          deleteUser: deleteUser,
        }
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async deleteAllUser() {
    try {
      await this.userModel.deleteMany()
      return {
        msg: 'Delete all user successfully',
        status: true,
      }
    } catch (error) {
      throw new Error(error)
    }
  }
}
