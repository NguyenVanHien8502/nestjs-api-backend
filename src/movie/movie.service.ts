import { ForbiddenException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, isValidObjectId } from 'mongoose'
import { Movie } from './movie.schema'
import { CreateMovieDto } from './dto/create-movie.dto'
import { UpdateMovieDto } from './dto/update-movie.dto'
import { Category } from '../category/category.schema'

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async createMovie(
    createMovieDto: CreateMovieDto,
    currentUserId: string,
    categoryId: string,
  ) {
    try {
      if (!isValidObjectId(categoryId)) {
        return {
          msg: 'Invalid category ID format. Please provide a valid category ID.',
          status: false,
        }
      }
      const findCategory = await this.categoryModel.findById(categoryId)
      if (!findCategory) {
        return {
          msg: 'Not exist this category, please pick other category again.',
          status: false,
        }
      }
      const newMovie = await this.movieModel.create({
        name: createMovieDto.name,
        slug: createMovieDto.slug,
        category: createMovieDto.category,
        link: createMovieDto.link,
        status: createMovieDto.status,
        desc: createMovieDto.desc,
        author: currentUserId,
      })
      return {
        msg: 'Created movie successfully',
        status: true,
        newMovie: newMovie,
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async getaMovie(id: string) {
    try {
      const findMovie = await this.movieModel.findById(id)
      if (!findMovie) {
        return {
          msg: 'Not found this movie',
          status: false,
        }
      }
      return findMovie
    } catch (error) {
      throw new Error(error)
    }
  }

  async getAllMovie() {
    try {
      const allMovie = await this.movieModel.find()
      return allMovie
    } catch (error) {
      throw new Error(error)
    }
  }

  async updateMovie(
    id: string,
    updateMovieDto: UpdateMovieDto,
    currentUserId: string,
    categoryId: string,
  ) {
    try {
      const findMovie = await this.movieModel.findById(id)
      if (!findMovie) {
        return {
          msg: 'Not exist this movie',
          status: false,
        }
      }
      if (findMovie?.author.toString() !== currentUserId) {
        throw new ForbiddenException('Not authorization')
      }
      if (!isValidObjectId(categoryId)) {
        return {
          msg: 'Invalid category ID format. Please provide a valid category ID.',
          status: false,
        }
      }
      const findCategory = await this.categoryModel.findById(categoryId)
      if (!findCategory) {
        return {
          msg: 'Not exist this category, please pick other category again.',
          status: false,
        }
      }
      const updatedMovie = await this.movieModel.findByIdAndUpdate(
        id,
        {
          name: updateMovieDto.name,
          slug: updateMovieDto.slug,
          category: updateMovieDto.category,
          link: updateMovieDto.link,
          status: updateMovieDto.status,
          desc: updateMovieDto.desc,
        },
        {
          new: true,
        },
      )
      return {
        msg: 'Updated movie successfully',
        status: true,
        updatedMovie: updatedMovie,
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async deleteMovie(id: string, currentUserId: string) {
    try {
      const findMovie = await this.movieModel.findById(id)
      if (!findMovie) {
        return {
          msg: 'Not exist this movie',
          status: false,
        }
      }
      if (findMovie?.author.toString() !== currentUserId) {
        return new ForbiddenException('Not authorization')
      }
      const deletedMovie = await this.movieModel.findByIdAndDelete(id)
      return {
        msg: 'Deleted movie successfully',
        status: true,
        deletedMovie: deletedMovie,
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async deleteAllMovie() {
    try {
      const deletedAllMovie = await this.movieModel.deleteMany()
      return deletedAllMovie
    } catch (error) {
      throw new Error(error)
    }
  }
}
