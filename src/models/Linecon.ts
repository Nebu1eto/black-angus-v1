import { prop, getModelForClass, Ref } from '@typegoose/typegoose'

export class LineconCategory {
  @prop({ required: true })
  originId!: number

  @prop({ required: true, minlength: 1, maxlength: 10 })
  name!: string

  @prop({ required: true, minlength: 1 })
  title!: string

  @prop({ required: true })
  path!: string

  @prop({ default: new Date() })
  createdAt!: Date
}

export class Linecon {
  @prop({ required: true, ref: LineconCategory })
  category!: Ref<LineconCategory>

  @prop({ required: true })
  name!: string

  @prop({ required: true })
  fullPath!: string

  @prop({ required: true })
  thumbnailPath!: string

  @prop({ default: false })
  animated!: boolean
}

export const LineconCategoryModel = getModelForClass(LineconCategory)
export const LineconModel = getModelForClass(Linecon)
