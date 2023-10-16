import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { brandSchema } from './brand.model'
import { UserModule } from '../user/user.module'
import { BrandController } from './brand.controller'
import { BrandService } from './brand.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Brand', schema: brandSchema }]),
    UserModule,
  ],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
