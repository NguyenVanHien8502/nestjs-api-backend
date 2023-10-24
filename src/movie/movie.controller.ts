import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import { MovieService } from './movie.service'
import { UserGuard } from '../user/user.guard'
import { ValidateMongodbId } from '../utils/validateMongodbId'
import { CreateMovieDto } from './dto/create-movie.dto'
import { UpdateMovieDto } from './dto/update-movie.dto'

@Controller('api/movie')
export class MovieController {
  constructor(private movieService: MovieService) {}
  @Post('create-movie')
  @UseGuards(UserGuard)
  async createMovie(@Body() createMovieDto: CreateMovieDto, @Req() req) {
    const currentUserId = req.user._id.toString()
    const newMovie = this.movieService.createMovie(
      createMovieDto,
      currentUserId,
    )
    return newMovie
  }

  @Get(':id')
  async getaMovie(@Param('id', ValidateMongodbId) id: string) {
    return this.movieService.getaMovie(id)
  }

  @Get()
  async getAllMovie() {
    return this.movieService.getAllMovie()
  }

  @Put(':id')
  @UseGuards(UserGuard)
  async updatedMovie(
    @Param('id', ValidateMongodbId) id: string,
    @Body() updateMovieDto: UpdateMovieDto,
    @Req() req,
  ) {
    const currentUserId = req.user._id.toString()

    return this.movieService.updateMovie(id, updateMovieDto, currentUserId)
  }

  @Delete(':id')
  @UseGuards(UserGuard)
  async deleteMovie(@Param('id', ValidateMongodbId) id: string, @Req() req) {
    const currentUserId = req.user._id.toString()
    return this.movieService.deleteMovie(id, currentUserId)
  }

  @Delete()
  @UseGuards(UserGuard)
  async deleteAllMovie() {
    return this.movieService.deleteAllMovie()
  }
}
