import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Request } from 'express'
import { Model } from 'mongoose'
import { User } from './user.schema'

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException('Not token at headers')
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      })
      const userCurrent = await this.userModel.findById(payload._id)
      if (!userCurrent) {
        throw new ForbiddenException('Not found user!!!')
      }

      if (userCurrent.role !== 'admin') {
        throw new ForbiddenException('You are not an admin')
      }
      request['user'] = {
        _id: userCurrent._id,
        username: userCurrent.username,
        email: userCurrent.email,
        phone: userCurrent.phone,
        role: userCurrent.role,
      }
    } catch (err) {
      throw new UnauthorizedException(err)
    }
    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
