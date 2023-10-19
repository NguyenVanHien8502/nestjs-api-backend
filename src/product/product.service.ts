import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Product } from './product.model'
import { CreateProductDto } from './dto/create-product'
import { UpdateProductDto } from './dto/update-product'

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  async createProduct(createProductDto: CreateProductDto) {
    try {
      const newProduct = await this.productModel.create(createProductDto)
      return {
        msg: 'Create Product Successfully',
        status: true,
        newProduct: newProduct,
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async getaProduct(prodId: string) {
    try {
      const findProduct = await this.productModel.findById(prodId)
      if (!findProduct) {
        return {
          msg: 'Not exist this product',
          status: false,
        }
      }
      return findProduct
    } catch (error) {
      throw new Error(error)
    }
  }

  async getAllProduct() {
    try {
      const allProduct = await this.productModel.find()
      return {
        allProduct: allProduct,
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async updatedProduct(prodId: string, updateProductDto: UpdateProductDto) {
    try {
      const findProduct = await this.productModel.findById(prodId)
      if (!findProduct) {
        return {
          msg: 'Not exist this product',
          status: false,
        }
      }
      const updatedProduct = await this.productModel.findByIdAndUpdate(
        prodId,
        {
          title: updateProductDto.title,
          description: updateProductDto.description,
          price: updateProductDto.price,
          quantity: updateProductDto.quantity,
        },
        {
          new: true,
        },
      )
      return {
        msg: 'Updated Product Successfully',
        status: true,
        updatedProduct: updatedProduct,
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async deleteSingleProduct(prodId: string) {
    try {
      const findProduct = await this.productModel.findById(prodId)
      if (!findProduct) {
        return {
          msg: 'Not exist this product',
          status: false,
        }
      }
      const deletedProduct = await this.productModel.findByIdAndDelete(prodId)
      return {
        msg: 'Deleted Product Successfully',
        status: true,
        deletedProduct: deletedProduct,
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async deleteAllProduct() {
    try {
      const deleteAllProduct = await this.productModel.deleteMany()
      return {
        msg: 'Deleted all product successfully',
        status: true,
        deleteAllProduct: deleteAllProduct,
      }
    } catch (error) {
      throw new Error(error)
    }
  }
}
