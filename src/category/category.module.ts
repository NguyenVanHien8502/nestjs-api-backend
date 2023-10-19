import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { categorySchema } from './category.model'
import { CategoryService } from './category.service'
import { CategoryController } from './category.controller'
import { MovieModule } from '../movie/movie.module'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Category', schema: categorySchema }]),
    // forwardRef(() => MovieModule),
    forwardRef(() => UserModule),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
