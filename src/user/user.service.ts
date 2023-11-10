import {
  ForbiddenException,
  Injectable,
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
import validator from 'validator'

@Injectable()
export class UserService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const { email, password, username, role, status, phone } = registerUserDto
    if (!email || !password || !username || !role) {
      return {
        msg: 'Please complete all information to register the account',
        status: false,
      }
    }
    const isValidEmail = (email: string) => {
      const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (re.test(email)) return true
      else return false
    }
    if (email !== '' && !isValidEmail(email)) {
      return {
        msg: 'Invalid email address',
        status: false,
      }
    }
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
    if (role !== 'user' && role !== 'admin') {
      return {
        msg: "Value of role must be 'user' or 'admin'",
        status: false,
      }
    }
    if (
      status &&
      status !== 'alone' &&
      status !== 'adult' &&
      status !== 'tretrow' &&
      status !== 'married'
    ) {
      return {
        msg: "Value of status must be 'alone' or 'adult' or 'tretrow' or 'married'",
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
  }

  async loginUser(loginUserDto: LoginUserDto, res: Response): Promise<any> {
    const { email, password } = loginUserDto
    if (!email || !password) {
      return {
        msg: 'Please complete all information to login',
        status: false,
      }
    }
    const isValidEmail = (email: string) => {
      const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (re.test(email)) return true
      else return false
    }
    if (email !== '' && !isValidEmail(email)) {
      return {
        msg: 'Invalid email address',
        status: false,
      }
    }
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
      throw new Error(error)
    }
  }

  async getAllUser(req: Request) {
    try {
      let options = {}

      if (req.query.s) {
        options = {
          $or: [
            { username: new RegExp(req.query.s.toString(), 'i') },
            { email: new RegExp(req.query.s.toString(), 'i') },
          ],
        }
      }

      let sortOrder = {}
      let users
      if (req.query.sort) {
        const sortName = Object.keys(req.query.sort)[0]
        sortOrder = { [sortName]: req.query.sort[sortName] }
        users = this.userModel.find(options).sort(sortOrder)
      } else {
        users = this.userModel.find(options).sort({ username: 'asc' })
      }

      const page: number = parseInt(req.query.page as any) || 1
      const limit = parseInt(req.query.limit as any) || 100
      const skip = (page - 1) * limit

      const totalUsers = await this.userModel.count(options)
      const data = await users.skip(skip).limit(limit).exec()

      return {
        data,
        status: true,
        sortOrder,
        totalUsers,
        page,
        limit,
        total_page: Math.ceil(totalUsers / limit),
      }
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

      if (!username || !role || !status) {
        return {
          msg: 'Please fill in the required fields to update a user',
          status: false,
        }
      }

      if (username !== '' && username.length < 2) {
        return {
          msg: 'Username should be least 2 characters',
          status: false,
        }
      }

      const validatePhoneNumber = (phoneNumber: string) => {
        return validator.isMobilePhone(phoneNumber)
      }

      if (!validatePhoneNumber(phone)) {
        return {
          msg: 'Please enter valid phone number',
          status: false,
        }
      }

      if (role !== 'admin' && role !== 'user') {
        return {
          msg: "Value of role must be 'admin' or 'user'",
          status: false,
        }
      }
      if (
        status !== 'alone' &&
        status !== 'adult' &&
        status !== 'tretrow' &&
        status !== 'married'
      ) {
        return {
          msg: "Value of status must be 'alone' or 'adult' or 'tretrow' or 'married'",
          status: false,
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
          msg: 'Deleted User Successfully',
          status: true,
          deleteUser: deleteUser,
        }
      }
    } catch (error) {
      throw new Error(error)
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
      throw new Error(error)
    }
  }
}
