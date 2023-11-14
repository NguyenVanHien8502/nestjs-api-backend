import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Category } from './category.schema'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import slugify from 'slugify'
import { Request } from 'express'

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}
  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      const { name, slug, status, desc } = createCategoryDto
      if (!name || !status) {
        return {
          msg: 'Please fill in the required fields to create a category',
          status: false,
        }
      }
      if (!slug) {
        createCategoryDto.slug = slugify(name)
      } else {
        createCategoryDto.slug = slugify(slug)
      }
      if (status !== 'public' && status !== 'private') {
        return {
          msg: "Value of status must be 'public' of 'private'",
          status: false,
        }
      }
      const newCategory = await this.categoryModel.create({
        name: name,
        slug: createCategoryDto.slug,
        status: status,
        desc: desc,
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

  async getAllCategory(req: Request) {
    try {
      let options = {}

      if (req.query.s) {
        options = { name: new RegExp(req.query.s.toString(), 'i') }
      }

      // let sortOrder = {}
      // if (req.query.sort) {
      //   const sortName = Object.keys(req.query.sort)[0]
      //   sortOrder = { [sortName]: req.query.sort[sortName] }
      // }
      // const categories = this.categoryModel.find(options).sort(sortOrder)

      const categories = this.categoryModel.find(options).sort({ name: 'asc' })

      const page: number = parseInt(req.query.page as any) || 1
      const limit = parseInt(req.query.limit as any) || 100
      const skip = (page - 1) * limit

      const totalCategories = await this.categoryModel.count(options)
      const data = await categories.skip(skip).limit(limit).exec()

      return {
        data,
        status: true,
        totalCategories,
        page,
        limit,
        total_page: Math.ceil(totalCategories / limit),
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const { name, slug, status, desc } = updateCategoryDto
      const findCategory = await this.categoryModel.findById(id)
      if (!findCategory) {
        return {
          msg: 'Not exist this category',
          status: false,
        }
      }
      if (!name || !status) {
        return {
          msg: 'Please fill in the required fields to update a category',
          status: false,
        }
      }

      if (!slug) {
        updateCategoryDto.slug = slugify(name)
      } else {
        updateCategoryDto.slug = slugify(slug)
      }

      if (status !== 'public' && status !== 'private') {
        return {
          msg: "Value of status must be 'public' of 'private'",
          status: false,
        }
      }
      const updatedCategory = await this.categoryModel.findByIdAndUpdate(
        id,
        {
          name: name,
          slug: updateCategoryDto.slug,
          status: status,
          desc: desc,
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

  async deleteManyCategory(req: Request) {
    try {
      const { categoryIds } = req.body
      categoryIds?.forEach(async (categoryId) => {
        const findCategory = await this.categoryModel.findById(categoryId)
        if (!findCategory) {
          return {
            msg: `CategoryId ${categoryId} is not exists`,
            status: false,
          }
        }
      })
      const deletedManyCategory = await this.categoryModel.deleteMany({
        _id: { $in: categoryIds },
      })
      return {
        msg: 'Deleted categories successfully',
        status: true,
        deletedManyCategory: deletedManyCategory,
      }
    } catch (error) {
      throw new Error(error)
    }
  }
}
