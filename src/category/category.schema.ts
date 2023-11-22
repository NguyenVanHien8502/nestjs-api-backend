import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { statusCategory } from '../utils/variableGlobal'

export type CategoryDocument = HydratedDocument<Category>

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true })
  slug: string

  @Prop({ enum: statusCategory, required: true })
  status: string

  @Prop()
  desc: string
}

export const CategorySchema = SchemaFactory.createForClass(Category)
