import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Category } from './category.schema'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import slugify from 'slugify'

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}
  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      if (
        createCategoryDto.status !== 'public' &&
        createCategoryDto.status !== 'private'
      ) {
        return {
          msg: "Value of status must be 'public' of 'private'",
          status: false,
        }
      }
      const newCategory = await this.categoryModel.create({
        name: createCategoryDto.name,
        slug: slugify(createCategoryDto.name),
        status: createCategoryDto.status,
        desc: createCategoryDto.desc,
      })

      return {
        msg: 'Created category successfully',
        status: true,
        newCategory: newCategory,
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async getaCategory(id: string) {
    try {
      const findCategory = await this.categoryModel.findById(id)
      if (!findCategory) {
        return {
          msg: 'Not found this category',
          status: false,
        }
      }
      return findCategory
    } catch (error) {
      throw new Error(error)
    }
  }

  async getAllCategory() {
    try {
      const allCategory = await this.categoryModel
        .find()
        .sort({ createdAt: -1 })
      return allCategory
    } catch (error) {
      throw new Error(error)
    }
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const findCategory = await this.categoryModel.findById(id)
      if (!findCategory) {
        return {
          msg: 'Not exist this category',
          status: false,
        }
      }
      if (
        updateCategoryDto.status !== 'public' &&
        updateCategoryDto.status !== 'private'
      ) {
        return {
          msg: "Value of status must be 'public' of 'private'",
          status: false,
        }
      }
      const updatedCategory = await this.categoryModel.findByIdAndUpdate(
        id,
        {
          name: updateCategoryDto.name,
          slug: slugify(updateCategoryDto.name),
          status: updateCategoryDto.status,
          desc: updateCategoryDto.desc,
        },
        {
          new: true,
        },
      )
      return {
        msg: 'Updated category successfully',
        status: true,
        updatedCategory: updatedCategory,
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async deleteCategory(id: string) {
    try {
      const findCategory = await this.categoryModel.findById(id)
      if (!findCategory) {
        return {
          msg: 'Not exist this category',
          status: false,
        }
      }
      const deletedCategory = await this.categoryModel.findByIdAndDelete(id)
      return {
        msg: 'Deleted category successfully',
        status: true,
        deletedCategory: deletedCategory,
      }
    } catch (error) {
      throw new Error(error)
    }
  }
}
