import { Controller, Post, UseGuards } from '@nestjs/common'
import { ProductService } from './product.service'
import { UserGuard } from '../user/user.guard'

@Controller('api/product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post('create-product')
  @UseGuards(UserGuard)
  async createProduct() {
    const newProduct = this.productService.createProduct()
    return newProduct
  }
}
