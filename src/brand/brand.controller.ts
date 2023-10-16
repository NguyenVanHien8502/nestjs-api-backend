import { Controller, Post, UseGuards } from '@nestjs/common'
import { UserGuard } from '../user/user.guard'
import { BrandService } from './brand.service'

@Controller('api/brand')
export class BrandController {
  constructor(private brandService: BrandService) {}

  @Post('create-brand')
  @UseGuards(UserGuard)
  async createBrand() {
    const newBrand = this.brandService.createBrand()
    return newBrand
  }
}
