import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Movie } from './movie.schema'
import { CreateMovieDto } from './dto/create-movie.dto'
import { UpdateMovieDto } from './dto/update-movie.dto'
import { Category } from '../category/category.schema'
import slugify from 'slugify'
import { Request } from 'express'
import { statusMovie } from '../utils/variableGlobal'

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async createMovie(createMovieDto: CreateMovieDto, currentUserId: string) {
    try {
      const { name, slug, categories, link, status, desc } = createMovieDto

      for (const category of categories) {
        const alreadyCategory = await this.categoryModel.findOne({
          name: category,
        })

        if (!alreadyCategory) {
          return {
            msg: 'Not exist this category, please pick again',
            status: false,
          }
        }
      }

      if (!status) {
        createMovieDto.status = statusMovie.pending
      }

      if (!slug) {
        const alreadySlugMovie = await this.movieModel.findOne({
          slug: slugify(name),
        })
        if (alreadySlugMovie) {
          return {
            msg: 'This slug already exists',
            status: false,
          }
        }
        createMovieDto.slug = slugify(name)
      } else {
        const alreadySlugMovie = await this.movieModel.findOne({
          slug: slugify(slug),
        })
        if (alreadySlugMovie) {
          return {
            msg: 'This slug already exists',
            status: false,
          }
        }
        createMovieDto.slug = slugify(slug)
      }

      if (
        createMovieDto.status !== statusMovie.pending &&
        createMovieDto.status !== statusMovie.processing &&
        createMovieDto.status !== statusMovie.active
      ) {
        return {
          msg: `Value of status must be ${statusMovie.pending} or ${statusMovie.processing} or ${statusMovie.active}`,
          status: false,
        }
      }

      const newMovie = await this.movieModel.create({
        name: name,
        slug: createMovieDto.slug,
        categories: categories,
        link: link,
        status: status ? status : 'pending',
        desc: desc,
        author: currentUserId,
      })

      return {
        msg: 'Created movie successfully',
        status: true,
        newMovie: newMovie,
      }
    } catch (error) {
      throw new BadRequestException(error)
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
      throw new NotFoundException(error)
    }
  }

  async getAllMovie(
    keySearch?: string,
    currentPage?: number,
    itemsPerPage?: number,
  ) {
    try {
      let options = {}

      if (keySearch) {
        options = {
          $or: [
            { name: new RegExp(keySearch.toString(), 'i') },
            { slug: new RegExp(keySearch.toString(), 'i') },
            { category: new RegExp(keySearch.toString(), 'i') },
          ],
        }
      }

      const movies = this.movieModel.find(options)

      const page: number = currentPage || 1
      const limit: number = itemsPerPage || 100
      const skip: number = (page - 1) * limit

      const totalMovies = await this.movieModel.count(options)
      const data = await movies.skip(skip).limit(limit).exec()

      return {
        data,
        status: true,
        totalMovies,
        page,
        limit,
      }
    } catch (error) {
      throw new NotFoundException(error)
    }
  }

  async updateMovie(
    id: string,
    updateMovieDto: UpdateMovieDto,
    currentUserId: string,
  ) {
    try {
      const { name, slug, categories, link, status, desc } = updateMovieDto

      const findMovie = await this.movieModel.findById(id)
      if (!findMovie) {
        return {
          msg: 'Not exist this movie',
          status: false,
        }
      }
      if (findMovie?.author.toString() !== currentUserId) {
        return {
          msg: 'Not authorization',
          status: false,
        }
      }

      for (const category of categories) {
        const alreadyCategory = await this.categoryModel.findOne({
          name: category,
        })
        if (!alreadyCategory) {
          return {
            msg: 'Not exist this category, please pick again',
            status: 'false',
          }
        }
      }

      const alreadySlugMovie = await this.movieModel.findOne({
        slug: slugify(slug),
      })
      if (alreadySlugMovie && alreadySlugMovie._id.toString() !== id) {
        return {
          msg: 'This slug already exists',
          status: false,
        }
      }
      updateMovieDto.slug = slugify(slug)

      //check value status
      if (
        updateMovieDto.status &&
        updateMovieDto.status !== statusMovie.pending &&
        updateMovieDto.status !== statusMovie.processing &&
        updateMovieDto.status !== statusMovie.active
      ) {
        return {
          msg: `Value of status must be ${statusMovie.pending} or ${statusMovie.processing} or ${statusMovie.active}`,
          status: false,
        }
      }

      const updatedMovie = await this.movieModel.findByIdAndUpdate(
        id,
        {
          name: name,
          slug: updateMovieDto.slug,
          categories: categories,
          link: link,
          status: status,
          desc: desc,
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
      throw new BadRequestException(error)
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
      throw new BadRequestException(error)
    }
  }

  async deleteManyMovie(req: Request) {
    try {
      const { movieIds } = req.body
      movieIds?.forEach(async (movieId: string) => {
        const findMovie = await this.movieModel.findById(movieId)
        if (!findMovie) {
          return {
            msg: `MovieId ${movieId} is not exists`,
            status: false,
          }
        }
      })
      const deletedManyMovie = await this.movieModel.deleteMany({
        _id: { $in: movieIds },
      })
      return {
        msg: 'Deleted movies successfully',
        status: true,
        deletedManyMovie: deletedManyMovie,
      }
    } catch (error) {
      throw new BadRequestException(error)
    }
  }
}
