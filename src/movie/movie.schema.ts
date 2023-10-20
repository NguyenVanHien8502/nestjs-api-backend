import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { HydratedDocument } from 'mongoose'
import { Category } from '../category/category.schema'
import { User } from '../user/user.schema'

export type MovieDocument = HydratedDocument<Movie>

@Schema()
export class Movie {
  @Prop({ required: true })
  name: string

  @Prop()
  slug: string

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  category: Category

  @Prop()
  link: string

  @Prop()
  status: string

  @Prop()
  desc: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  author: User
}

export const MovieSchema = SchemaFactory.createForClass(Movie)
