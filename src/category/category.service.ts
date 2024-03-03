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

  async getAllCategory(
    keySearch?: string,
    currentPage?: number,
    itemsPerPage?: number,
  ) {
    try {
      let options = {}

      if (keySearch) {
        options = { name: new RegExp(keySearch.toString(), 'i') }
      }

      const categories = this.categoryModel.find(options)

      const page: number = currentPage || 1
      const limit: number = itemsPerPage || 100
      const skip: number = (page - 1) * limit

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
    // return new Promise((resolve, reject) => {
    //   this.categoryModel
    //     .findById(id)
    //     .then((data) => {
    //       if (!data) {
    //         resolve({
    //           msg: 'Not exist this category',
    //           status: false,
    //         })
    //       }
    //       return this.categoryModel.findByIdAndDelete(id)
    //     })
    //     .then((data) => {
    //       resolve({
    //         msg: 'Deleted category successfully',
    //         status: true,
    //         deletedCategory: data,
    //       })
    //     })
    //     .catch((err) => {
    //       reject(err)
    //     })
    // })

    // return new Promise((resolve, reject) => {
    //   this.categoryModel
    //     .findById(id)
    //     .then((data) => {
    //       if (!data) {
    //         resolve({
    //           msg: 'Not exist this category',
    //           status: false,
    //         })
    //       }
    //       this.categoryModel
    //         .findByIdAndDelete(id)
    //         .then((data) => {
    //           resolve({
    //             msg: 'Deleted category successfully',
    //             status: true,
    //             deletedCategory: data,
    //           })
    //         })
    //         .catch((err) => {
    //           reject(err)
    //         })
    //     })
    //     .catch((err) => {
    //       reject(err)
    //     })
    // })

    try {
      const findCategory = await this.categoryModel.findById(id)
      if (!findCategory) {
        return {
          msg: 'Not exist this category',
          status: false,
        }
      }
      const deletedCategory = await this.categoryModel.findByIdAndDelete(id, {
        returnDocument: 'before',
      })
      console.log(deletedCategory)

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
      categoryIds?.forEach(async (categoryId: string) => {
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

  //  function tong(a, b, callback ) {
  //   console.log('Tong: ' + (a + b));
  //   return callback(a + b);
  //   }
  //   var tinh_tong = tong(3, 5, function (sum) {
  //     console.log("2");
  //     return sum+2;
  //     })
  //   alert(tinh_tong);

  test() {
    const p1 = [
      [1, 3],
      [5, 5],
      [15, 16],
      [20, 23],
    ]
    const p2 = [
      [1, 4],
      [5, 5],
      [12, 16],
      [23, 23],
    ]

    const allHours = new Array(24).fill(0) //tạo mảng allHours có 24 phẩn tử bằng 0

    // flat person 1 array
    for (let i = 0; i < p1.length; i++) {
      allHours.fill(1, p1[i][0], p1[i][1] + 1)
    }

    // flat person 2 array
    for (let i = 0; i < p2.length; i++)
      for (let j = p2[i][0]; j <= p2[i][1]; j++) {
        if (allHours[j] == 1) allHours[j] = 2
        if (allHours[j] == 0) allHours[j] = 1
      }

    console.log(allHours)

    // tinh toan khoang thoi gian
    const result = []
    let startIndex = null

    for (let i = 0; i < allHours.length; i++) {
      if (allHours[i] === 2) {
        if (startIndex === null) {
          startIndex = i
        }
      } else if (startIndex !== null) {
        result.push([startIndex, i - 1])
        startIndex = null
      }
    }

    // Kiểm tra nếu mảng kết thúc bằng số 2
    if (startIndex !== null) {
      result.push([startIndex, allHours.length - 1])
    }
    console.log(result)
  }

  test1() {
    const users = [
      {
        name: 'Thu',
        email: 'thu@gmail.com',
        city: 'Ha noi',
        phone: '123',
      },
      {
        name: 'Toan',
        email: 'toan@gmail.com',
        city: 'Ha noi',
        phone: '123',
      },
      {
        name: 'Lan',
        email: 'lan@gmail.com',
        city: '',
        phone: '123',
      },
      {
        name: 'Phong',
        email: 'thu@gmail.com',
        city: 'Ha noi',
        phone: '',
      },
      {
        name: 'Long',
        email: 'thu@gmail.com',
        city: null,
        phone: '123',
      },
    ]

    // const result = []
    // users.map((item) => {
    //   if (
    //     !Object.values(item).includes('') &&
    //     !Object.values(item).includes(null)
    //   ) {
    //     return result.push(item)
    //   }
    // })

    // const result = []
    // users.forEach((item) => {
    //   if (
    //     !Object.values(item).includes('') &&
    //     !Object.values(item).includes(null)
    //   ) {
    //     result.push(item)
    //   }
    // })

    const result = users.filter(
      (item) =>
        !Object.values(item).includes('') &&
        !Object.values(item).includes(null),
    )

    // const result = users.filter((item) => {
    //   return !Object.values(item).some((fieldValue) => {
    //     return fieldValue === '' || fieldValue === null
    //   })
    // })

    // const result = users.filter((item) => {
    //   return Object.values(item).every((value) => {
    //     return value !== '' && value !== null
    //   })
    // })

    console.log(result)
  }

  test2() {
    const input = [
      {
        id: 1,
        parent: null,
        name: 'mobile',
      },
      {
        id: 2,
        parent: 1,
        name: 'samsung',
      },
      {
        id: 3,
        parent: 1,
        name: 'apple',
      },
      {
        id: 4,
        parent: 3,
        name: 'iphone',
      },
      {
        id: 5,
        parent: 2,
        name: 's10',
      },
      {
        id: 6,
        parent: 1,
        name: 'google',
      },
      {
        id: 7,
        parent: null,
        name: 'television',
      },
      {
        id: 8,
        parent: 7,
        name: 'air conditional',
      },
    ]
    //['mobile', 'mobile/samsung', 'mobile/samsung/s10', 'mobile/apple', 'mobile/apple/iphone', 'mobile/google', 'television', 'television/air conditional']
    //['mobile', 'mobile/samsung', 'mobile/apple', 'mobile/apple/iphone', 'mobile/samsung/s10', 'mobile/google', 'television', 'television/air conditional']

    const getName = (id, name) => {
      const data = input.find((v) => v.id === id)
      if (!data?.id) return
      if (!data.parent) return data.name + '/' + name
      return getName(data.parent, data.name) + '/' + name
    }

    console.log(
      input.map((v) => {
        if (!v.parent) return v.name
        return getName(v.parent, v.name)
      }),
    )

    // const buildPaths = (parentId, rootPath) => {
    //   const result = []
    //   input.forEach((item) => {
    //     if (item.id === parentId) {
    //       const childPath = `${item.name}/${rootPath}`
    //       const otherChildPath = buildPaths(item.parent, childPath)
    //       if (!item.parent) {
    //         result.push(childPath)
    //       } else {
    //         result.push(...otherChildPath)
    //       }
    //     }
    //   })
    //   return result
    // }

    // const paths = []
    // input.forEach((item) => {
    //   if (!item.parent) {
    //     paths.push(item.name)
    //   } else {
    //     const otherPath = buildPaths(item.parent, item.name)
    //     paths.push(...otherPath)
    //   }
    // })

    // console.log(paths)

    // const buildPaths = (parentId, rootPath) => {
    //   const result = []
    //   input.forEach((item) => {
    //     if (item.parent === parentId) {
    //       const childPath = `${rootPath}/${item.name}`
    //       const otherChildPath = buildPaths(item.id, childPath)
    //       result.push(childPath, ...otherChildPath)
    //     }
    //   })
    //   return result
    // }

    // const paths = []
    // input.forEach((item) => {
    //   if (!item.parent) {
    //     paths.push(item.name)
    //     const otherPath = buildPaths(item.id, item.name)
    //     paths.push(...otherPath)
    //   }
    // })
  }

  test3() {
    const fruit = ['banana', 'apple', 'coconut', 'orange']

    const addFruit = (value) => {
      let count = 0
      fruit.forEach((item) => {
        if (item.includes(value)) count = count + 1
      })
      if (count > 0) fruit.push(value + '_' + count)
      else fruit.push(value)
    }

    addFruit('banana')
    addFruit('abc')
    addFruit('banana')
    console.log(fruit)
  }

  test4() {
    const checkUsername = (username) => {
      if (username.length < 5) {
        return false
      } else return !username.includes('ww')
    }
    const T = parseInt(prompt('Enter testcases: '))
    for (let i = 0; i < T; i++) {
      const username = prompt('Enter your username:')
      if (checkUsername(username)) console.log('Valid')
      else
        username.length >= 5
          ? console.log('Invalid')
          : console.log(`Too short: ${username.length}`)
    }
  }
}
