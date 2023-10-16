import { Module } from '@nestjs/common'
import { ProductController } from './product.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { productSchema } from './product.model'
import { ProductService } from './product.service'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: productSchema }]),
    UserModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
