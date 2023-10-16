import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Brand } from './brand.model'

@Injectable()
export class BrandService {
  constructor(
    @InjectModel('Brand') private readonly brandModel: Model<Brand>,
  ) {}
  async createBrand() {
    return 'create brand'
  }
}
