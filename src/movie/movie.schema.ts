import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { HydratedDocument } from 'mongoose'
import { User } from '../user/user.schema'

export type MovieDocument = HydratedDocument<Movie>

@Schema({ timestamps: true })
export class Movie {
  @Prop({ required: true })
  name: string

  @Prop()
  slug: string

  @Prop({ required: true })
  category: string

  @Prop()
  link: string

  @Prop({ required: true, enum: ['pending', 'processing', 'done'] })
  status: string

  @Prop()
  desc: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  author: User
}

export const MovieSchema = SchemaFactory.createForClass(Movie)
