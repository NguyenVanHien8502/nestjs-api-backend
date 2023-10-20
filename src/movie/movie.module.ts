import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Movie, MovieSchema } from './movie.schema'
import { CategoryModule } from '../category/category.module'
import { MovieController } from './movie.controller'
import { MovieService } from './movie.service'
import { UserModule } from '../user/user.module'
import { Category, CategorySchema } from '../category/category.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    UserModule,
    CategoryModule,
  ],
  controllers: [MovieController],
  providers: [MovieService],
  exports: [MovieService],
})
export class MovieModule {}
