/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from './user.model'
@Injectable()
export class UserService {
  private users: User[] = []
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}
  async register(
    username: string,
    email: string,
    password: string,
    age: number,
  ) {
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
      username,
      email,
      password,
      age,
    })
    return {
      msg: 'Register Successfully',
      status: true,
      newUser: newUser,
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
}
