import { ForbiddenException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Movie } from './movie.schema'
import { CreateMovieDto } from './dto/create-movie.dto'
import { UpdateMovieDto } from './dto/update-movie.dto'
import { Category } from '../category/category.schema'
import slugify from 'slugify'
import { Request } from 'express'

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async createMovie(createMovieDto: CreateMovieDto, currentUserId: string) {
    try {
      const { name, slug, category, link, status, desc } = createMovieDto
      if (!name || !category || !link || !status) {
        return {
          msg: 'Please fill in the required fields to create a movie',
          status: false,
        }
      }
      if (!slug) {
        createMovieDto.slug = slugify(name)
      } else {
        createMovieDto.slug = slugify(slug)
      }
      if (
        status !== 'pending' &&
        status !== 'processing' &&
        status !== 'active'
      ) {
        return {
          msg: "Value of status must be 'pending' or 'processing' or 'active'",
          status: false,
        }
      }

      //check validate link url
      const isValidUrl = (urlString: string) => {
        const urlPattern = new RegExp(
          '^(https?:\\/\\/)?' + // validate protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
            '(\\#[-a-z\\d_]*)?$',
          'i',
        ) // validate fragment locator
        return !!urlPattern.test(urlString)
      }
      if (!isValidUrl(createMovieDto.link)) {
        return {
          msg: 'Please fill in the correct url link format',
          status: false,
        }
      }

      const newMovie = await this.movieModel.create({
        name: name,
        slug: createMovieDto.slug,
        category: category,
        link: link,
        status: status,
        desc: desc,
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

  async getAllMovie(req: Request) {
    try {
      let options = {}

      if (req.query.s) {
        options = {
          $or: [
            { name: new RegExp(req.query.s.toString(), 'i') },
            { slug: new RegExp(req.query.s.toString(), 'i') },
            { category: new RegExp(req.query.s.toString(), 'i') },
          ],
        }
      }

      let sortOrder = {}
      let movies
      if (req.query.sort) {
        const sortName = Object.keys(req.query.sort)[0]
        sortOrder = { [sortName]: req.query.sort[sortName] }
        movies = this.movieModel.find(options).sort(sortOrder)
      } else {
        movies = this.movieModel.find(options).sort({ name: 'asc' })
      }

      const page: number = parseInt(req.query.page as any) || 1
      const limit = parseInt(req.query.limit as any) || 100
      const skip = (page - 1) * limit

      const totalMovies = await this.movieModel.count(options)
      const data = await movies.skip(skip).limit(limit).exec()

      return {
        data,
        status: true,
        sortOrder,
        totalMovies,
        page,
        limit,
        total_page: Math.ceil(totalMovies / limit),
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async updateMovie(
    id: string,
    updateMovieDto: UpdateMovieDto,
    currentUserId: string,
  ) {
    try {
      const { name, slug, category, link, status, desc } = updateMovieDto
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

      if (!name || !category || !link || !status) {
        return {
          msg: 'Please fill in the required fields to update a movie',
          status: false,
        }
      }

      if (!slug) {
        updateMovieDto.slug = slugify(name)
      } else {
        updateMovieDto.slug = slugify(slug)
      }

      //check value status
      if (
        updateMovieDto.status !== 'pending' &&
        updateMovieDto.status !== 'processing' &&
        updateMovieDto.status !== 'active'
      ) {
        return {
          msg: "Value of status must be 'pending' or 'processing' or 'active'",
          status: false,
        }
      }

      //check validate link url
      const isValidUrl = (urlString: string) => {
        const urlPattern = new RegExp(
          '^(https?:\\/\\/)?' + // validate protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
            '(\\#[-a-z\\d_]*)?$',
          'i',
        )
        return !!urlPattern.test(urlString)
      }
      if (!isValidUrl(updateMovieDto.link)) {
        return {
          msg: 'Please fill in the correct url link format',
          status: false,
        }
      }
      const updatedMovie = await this.movieModel.findByIdAndUpdate(
        id,
        {
          name: name,
          slug: updateMovieDto.slug,
          category: category,
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

  async deleteManyMovie(req: Request) {
    try {
      const { movieIds } = req.body
      movieIds?.forEach(async (movieId) => {
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
      throw new Error(error)
    }
  }
}
