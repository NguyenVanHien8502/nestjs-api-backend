/* eslint-disable prettier/prettier */

import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'

export const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSaltSync(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.isMatchedPassword = async function (enterPassword: string) {
  return await bcrypt.compare(enterPassword, this.password)
}

export interface User extends Document {
  _id: any
  username: string
  email: string
  password: string
  age?: number
  isMatchedPassword(enteredPassword: string): Promise<boolean>
}
