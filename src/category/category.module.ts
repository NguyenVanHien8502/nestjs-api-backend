import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CategoryService } from './category.service'
import { CategoryController } from './category.controller'
import { UserModule } from '../user/user.module'
import { Category, CategorySchema } from './category.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    UserModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
