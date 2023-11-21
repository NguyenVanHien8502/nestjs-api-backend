import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { HydratedDocument } from 'mongoose'
import { User } from '../user/user.schema'
import { statusMovie } from '../utils/variableGlobal'

export type MovieDocument = HydratedDocument<Movie>

@Schema({ timestamps: true })
export class Movie {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true })
  slug: string

  @Prop({ required: true })
  categories: string

  @Prop({ required: true })
  link: string

  @Prop({ enum: statusMovie, default: statusMovie.pending })
  status: string

  @Prop()
  desc: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  author: User
}

export const MovieSchema = SchemaFactory.createForClass(Movie)
