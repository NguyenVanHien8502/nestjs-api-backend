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
import { ValidateMongodbId } from '../utils/validateMongodbId'
import { CreateMovieDto } from './dto/create-movie.dto'
import { UpdateMovieDto } from './dto/update-movie.dto'
import { Request } from 'express'
import { AdminGuard } from '../user/admin.guard'
import { UserGuard } from '../user/user.guard'

@Controller('api/movie')
export class MovieController {
  constructor(private movieService: MovieService) {}
  @Post('create-movie')
  @UseGuards(AdminGuard)
  async createMovie(@Body() createMovieDto: CreateMovieDto, @Req() req) {
    const currentUserId = req.user._id.toString()
    const newMovie = this.movieService.createMovie(
      createMovieDto,
      currentUserId,
    )
    return newMovie
  }

  @Get(':id')
  @UseGuards(UserGuard)
  async getaMovie(@Param('id', ValidateMongodbId) id: string) {
    return this.movieService.getaMovie(id)
  }

  @Get()
  @UseGuards(UserGuard)
  async getAllMovie(@Req() req: Request) {
    return await this.movieService.getAllMovie(req)
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async updatedMovie(
    @Param('id', ValidateMongodbId) id: string,
    @Body() updateMovieDto: UpdateMovieDto,
    @Req() req,
  ) {
    const currentUserId = req.user._id.toString()

    return this.movieService.updateMovie(id, updateMovieDto, currentUserId)
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteMovie(@Param('id', ValidateMongodbId) id: string, @Req() req) {
    const currentUserId = req.user._id.toString()
    return this.movieService.deleteMovie(id, currentUserId)
  }

  @Delete()
  @UseGuards(AdminGuard)
  async deleteManyMovie(@Req() req: Request) {
    return this.movieService.deleteManyMovie(req)
  }
}
