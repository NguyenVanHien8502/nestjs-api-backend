import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { movieSchema } from './movie.model'
import { CategoryModule } from '../category/category.module'
import { MovieController } from './movie.controller'
import { MovieService } from './movie.service'
import { UserModule } from '../user/user.module'
import { categorySchema } from '../category/category.model'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Movie', schema: movieSchema }]),
    MongooseModule.forFeature([{ name: 'Category', schema: categorySchema }]),
    forwardRef(() => UserModule),
    // forwardRef(() => CategoryModule),
  ],
  controllers: [MovieController],
  providers: [MovieService],
  exports: [MovieService],
})
export class MovieModule {}
