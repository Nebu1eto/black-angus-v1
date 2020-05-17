import { getModelForClass, prop, Ref } from '@typegoose/typegoose'

export enum EmoticonType {
  MANUAL = 'MANUAL',
  LINE = 'LINE',
  // DCINSIDE = 'DCINSIDE',
  // KAKAO = 'KAKAO',
}

export class EmoticonCategory {
  @prop({ required: true })
  type!: EmoticonType

  @prop({ required: true })
  referenceLink!: string

  @prop({ required: false })
  originId?: number

  @prop({ required: true, minlength: 1, maxlength: 10 })
  name!: string

  @prop({ required: true, minlength: 1 })
  title!: string

  @prop({ required: true })
  path!: string

  @prop({ default: new Date() })
  createdAt!: Date
}

export class Emoticon {
  @prop({ required: true, default: EmoticonType.MANUAL })
  type!: EmoticonType

  @prop({ required: false, ref: EmoticonCategory })
  category?: Ref<EmoticonCategory>

  @prop({ required: true, minlength: 1, maxlength: 10 })
  name!: string

  @prop({ default: [] })
  equivalents: string[] = []

  @prop({ required: true })
  fullPath!: string

  @prop({ required: false })
  thumbnailPath!: string

  @prop({ default: false })
  animated!: boolean

  @prop({ default: false })
  voiceAttached!: boolean

  @prop({ required: false })
  voicePath?: string

  @prop({ default: false })
  removed!: boolean

  @prop({ default: new Date() })
  createdAt!: Date

  @prop({ default: new Date() })
  updatedAt!: Date
}

export enum EmoticonActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  SEARCH = 'SEARCH',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

// for search emoticon lists more fast.
export class EmoticonName {
  @prop({ required: true })
  name!: string
}

export const EmoticonModel = getModelForClass(Emoticon)
export const EmoticonCategoryModel = getModelForClass(EmoticonCategory)
export const EmoticonNameModel = getModelForClass(EmoticonName)
