import * as mongoose from 'mongoose'

export const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
    },
    status: {
      type: String,
    },
    desc: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export interface Category {
  _id: any
  name: string
  slug: string
  status: string
  desc: string
}
