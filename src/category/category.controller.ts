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
import { UserGuard } from '../user/user.guard'
import { ValidateMongodbId } from '../utils/validateMongodbId'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { Request } from 'express'
import { AdminGuard } from '../user/admin.guard'

@Controller('api/category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post('create-category')
  @UseGuards(AdminGuard)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    const newCategory = this.categoryService.createCategory(createCategoryDto)
    return newCategory
  }

  @Get(':id')
  @UseGuards(UserGuard)
  async getaCategory(@Param('id', ValidateMongodbId) id: string) {
    return this.categoryService.getaCategory(id)
  }

  @Get()
  @UseGuards(UserGuard)
  async getAllCategory(@Req() req: Request) {
    return await this.categoryService.getAllCategory(req)
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async updatedCategory(
    @Param('id', ValidateMongodbId) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto)
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteCategory(@Param('id', ValidateMongodbId) id: string) {
    return this.categoryService.deleteCategory(id)
  }

  @Delete()
  @UseGuards(AdminGuard)
  async deleteManyCategory(@Req() req: Request) {
    return this.categoryService.deleteManyCategory(req)
  }
}
