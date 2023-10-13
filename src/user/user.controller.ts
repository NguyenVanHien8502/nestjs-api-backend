import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { UserService } from './user.service'
import { RegisterUserDto } from './dto/register-user.dto'
import { UserGuard } from './user.guard'
import { Request, Response } from 'express'
// import * as dotenv from 'dotenv'
// dotenv.config()

// domain: http://abc.localhost:3000
// @Controller({
//   host: 'abc.localhost',
// })
// @Controller({ host: ':abc' })

@Controller('api/user') //domain: http://localhost:3000/api/user
export class UserController {
  constructor(private userService: UserService) {}

  //some requests from clients
  @Post('register')
  @Header('Cache-Control', 'none') //response có thêm phần Cache-Control với value là none ở Header
  async register(@Body() registerUserDto: RegisterUserDto) {
    const result = await this.userService.register(registerUserDto)
    return result
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginUser(
    @Body() registerUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const dataUser = await this.userService.loginUser(registerUserDto, res)
      return dataUser
    } catch (err) {
      throw new Error(err)
    }
  }

  @Get('refreshToken')
  async handleRefreshToken(@Req() req: Request) {
    try {
      const refreshToken = req.cookies.refreshToken
      const newToken = await this.userService.handleRefreshToken(refreshToken)
      return newToken
    } catch (error) {
      throw new Error(error)
    }
  }

  @Get('profile')
  @UseGuards(UserGuard)
  getProfile(@Req() req) {
    return req.user
  }

  @Get()
  @UseGuards(UserGuard)
  async getAllUser() {
    const allUsers = await this.userService.getAllUser()
    return {
      allUsers: allUsers,
    }
  }

  @Get(':id')
  @UseGuards(UserGuard)
  async getaUser(@Param() params: any) {
    const user = await this.userService.getaUser(params.id)
    return {
      user: user,
    }
  }

  @Put(':id')
  @UseGuards(UserGuard)
  async updateUser(
    @Param() params: any,
    @Body('username') username: string,
    @Body('age') age: number,
  ) {
    const result = await this.userService.updateUser(params.id, username, age)
    return result
  }

  @Delete(':id')
  @UseGuards(UserGuard)
  async deleteUser(@Param() params: any) {
    try {
      const result = await this.userService.deleteUser(params.id)
      return result
    } catch (error) {
      throw new Error(error)
    }
  }

  @Delete()
  @UseGuards(UserGuard)
  async deleteAllUser() {
    try {
      const result = await this.userService.deleteAllUser()
      return result
    } catch (error) {
      throw new Error(error)
    }
  }
}
