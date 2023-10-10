import { MongooseModule } from '@nestjs/mongoose'
import { Module } from '@nestjs/common'
import { userSchema } from './user.model'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: userSchema }])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
