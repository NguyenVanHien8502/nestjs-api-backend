import * as mongoose from 'mongoose'

export const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    link: {
      type: String,
    },
    status: {
      type: String,
    },
    desc: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

export interface Movie {
  _id: any
  name: string
  slug: string
  category: object
  link: string
  status: string
  desc: string
  author: object
}
