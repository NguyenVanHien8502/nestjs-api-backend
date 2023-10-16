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
import { ProductService } from './product.service'
import { UserGuard } from '../user/user.guard'
import { CreateProductDto } from './dto/create-product'
import { ValidateMongodbId } from '../utils/validateMongodbId'
import { UpdateProductDto } from './dto/update-product'

@Controller('api/product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post('create-product')
  @UseGuards(UserGuard)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const newProduct = await this.productService.createProduct(createProductDto)
    return newProduct
  }

  @Get('/:id')
  async getaProduct(@Param('id', ValidateMongodbId) prodId: string) {
    const findProduct = await this.productService.getaProduct(prodId)
    return findProduct
  }

  @Get()
  async getAllProduct() {
    const allProduct = await this.productService.getAllProduct()
    return allProduct
  }

  @Put('/:id')
  @UseGuards(UserGuard)
  async updatedProduct(
    @Param('id', ValidateMongodbId) prodId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const updatedProduct = await this.productService.updatedProduct(
      prodId,
      updateProductDto,
    )
    return updatedProduct
  }

  @Delete('/:id')
  @UseGuards(UserGuard)
  async deletedProduct(@Param('id', ValidateMongodbId) prodId: string) {
    const deletedProduct = await this.productService.deleteSingleProduct(prodId)
    return deletedProduct
  }

  @Delete()
  @UseGuards(UserGuard)
  async deleteAllProduct() {
    const deleteAllProduct = await this.productService.deleteAllProduct()
    return deleteAllProduct
  }
}
