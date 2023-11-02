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
import { ValidateMongodbId } from '../utils/validateMongodbId'
import { LoginUserDto } from './dto/login-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { AdminGuard } from './admin.guard'
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
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const dataUser = await this.userService.loginUser(loginUserDto, res)
      return dataUser
    } catch (err) {
      throw new Error(err)
    }
  }

  @Get('refreshToken')
  @UseGuards(UserGuard)
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
  @UseGuards(AdminGuard)
  async getAllUser(@Req() req: Request) {
    return await this.userService.getAllUser(req)
  }

  @Get(':id')
  @UseGuards(UserGuard)
  async getaUser(@Param('id', ValidateMongodbId) id: string) {
    const user = await this.userService.getaUser(id)
    return user
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async updateUser(
    @Param(ValidateMongodbId) params: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const result = await this.userService.updateUser(params.id, updateUserDto)
    return result
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteUser(@Param(ValidateMongodbId) params: any) {
    try {
      const result = await this.userService.deleteUser(params.id)
      return result
    } catch (error) {
      throw new Error(error)
    }
  }

  @Delete()
  @UseGuards(AdminGuard)
  async deleteManyUser(@Req() req: Request) {
    try {
      return await this.userService.deleteManyUser(req)
    } catch (error) {
      throw new Error(error)
    }
  }
}
