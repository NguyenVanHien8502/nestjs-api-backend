import * as mongoose from 'mongoose'

export const brandSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export interface Brand {
  _id: any
  title: string
  description: string
}
