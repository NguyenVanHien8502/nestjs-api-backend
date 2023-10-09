/* eslint-disable prettier/prettier */
import { Controller, Header, HttpCode, Post, Redirect, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
    authService.doSomething()
  }
  //some requests from clients
  @Post('register')
  @HttpCode(200) //response trả về có statusCode là 200
  @Header('Cache-Control', 'none') //response có thêm phần Cache-Control với value là none ở Header
  register(@Req() request: Request, @Res() response: Response) {
    // return 'register a new user'
    const nameuser: string = request.body?.name
    console.log(nameuser)
    if (nameuser) {
      response.json('vcl')
    } else {
      response.json({
        x: 1,
        y: 2,
        name: 'Hiennn',
      })
    }
  }

  @Post('login')
  @Redirect('https://nestjs.com', 301)
  login() {
    return 'login to your account'
  }
}
