import * as bcrypt from 'bcrypt'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import * as mongoose from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema()
export class User {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
  }) // Thêm decorator type cho trường "_id"
  _id: any

  @Prop({ required: true })
  username: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop()
  phone: string

  @Prop({ required: true })
  password: string

  @Prop({ default: 'user' })
  role: string

  @Prop()
  status: string

  @Prop()
  refreshToken: string

  // eslint-disable-next-line @typescript-eslint/ban-types
  isMatchedPassword: Function
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  try {
    const salt = await bcrypt.genSaltSync(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
  } catch (error) {
    return next(error)
  }
})

UserSchema.methods.isMatchedPassword = async function (enterPassword: string) {
  return await bcrypt.compare(enterPassword, this.password)
}
