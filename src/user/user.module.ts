import { MongooseModule } from '@nestjs/mongoose'
import { Module, forwardRef } from '@nestjs/common'
import { userSchema } from './user.model'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { ProductModule } from '../product/product.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: userSchema }]),
    forwardRef(() => ProductModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule],
})
export class UserModule {}
