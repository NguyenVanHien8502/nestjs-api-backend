import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Category } from './category.schema'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import slugify from 'slugify'
import { Request } from 'express'
import { statusCategory } from '../utils/variableGlobal'

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}
  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      const { name, slug, status, desc } = createCategoryDto
      console.log(createCategoryDto)

      if (!status) {
        createCategoryDto.status = statusCategory.public
      }

      if (!slug) {
        const alreadySlugCategory = await this.categoryModel.findOne({
          slug: slugify(name),
        })
        if (alreadySlugCategory) {
          return {
            msg: 'This slug already exists',
            status: false,
          }
        }
        createCategoryDto.slug = slugify(name)
      } else {
        const alreadySlugCategory = await this.categoryModel.findOne({
          slug: slugify(slug),
        })
        if (alreadySlugCategory) {
          return {
            msg: 'This slug already exists',
            status: false,
          }
        }
        createCategoryDto.slug = slugify(slug)
      }

      //check value status
      if (
        createCategoryDto.status &&
        createCategoryDto.status !== statusCategory.public &&
        createCategoryDto.status !== statusCategory.private
      ) {
        return {
          msg: `Value of status must be ${statusCategory.public} or ${statusCategory.private}`,
          status: false,
        }
      }
      const newCategory = await this.categoryModel.create({
        name: name,
        slug: createCategoryDto.slug,
        status: status ? status : statusCategory.public,
        desc: desc,
      })

      return {
        msg: 'Created category successfully',
        status: true,
        newCategory: newCategory,
      }
    } catch (error) {
      throw new BadRequestException(error)
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
      throw new NotFoundException(error)
    }
  }

  async getAllCategory(req: Request) {
    try {
      let options = {}

      if (req.query.s) {
        options = { name: new RegExp(req.query.s.toString(), 'i') }
      }

      const categories = this.categoryModel.find(options)

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
      }
    } catch (error) {
      throw new NotFoundException(error)
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

      const alreadySlugCategory = await this.categoryModel.findOne({
        slug: slugify(slug),
      })
      if (alreadySlugCategory && alreadySlugCategory._id.toString() !== id) {
        return {
          msg: 'This slug already exists',
          status: false,
        }
      }
      updateCategoryDto.slug = slugify(slug)

      //check value status
      if (
        updateCategoryDto.status &&
        updateCategoryDto.status !== statusCategory.public &&
        updateCategoryDto.status !== statusCategory.private
      ) {
        return {
          msg: `Value of status must be ${statusCategory.public} or ${statusCategory.private}`,
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
      throw new BadRequestException(error)
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
      throw new BadRequestException(error)
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
      throw new BadRequestException(error)
    }
  }
}
