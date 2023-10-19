import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { UserGuard } from '../user/user.guard'
import { ValidateMongodbId } from '../utils/validateMongodbId'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Controller('api/category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post('create-category')
  @UseGuards(UserGuard)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    const newCategory = this.categoryService.createCategory(createCategoryDto)
    return newCategory
  }

  @Get(':id')
  async getaCategory(@Param('id', ValidateMongodbId) id: string) {
    return this.categoryService.getaCategory(id)
  }

  @Get()
  async getAllCategory() {
    return this.categoryService.getAllCategory()
  }

  @Put(':id')
  @UseGuards(UserGuard)
  async updatedCategory(
    @Param('id', ValidateMongodbId) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto)
  }

  @Delete(':id')
  @UseGuards(UserGuard)
  async deleteCategory(@Param('id', ValidateMongodbId) id: string) {
    return this.categoryService.deleteCategory(id)
  }
}
