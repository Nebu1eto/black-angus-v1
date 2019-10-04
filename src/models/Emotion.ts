import { prop, getModelForClass, Ref } from '@typegoose/typegoose'

export class Emoticon {
  @prop({ required: true, minlength: 1, maxlength: 10 })
  name!: string

  @prop({ default: [] })
  equivalents: string[] = []

  @prop({ required: true })
  path!: string

  @prop({ default: false, required: true })
  removed!: boolean

  @prop({ required: true, default: new Date() })
  createdAt!: Date

  @prop({ required: true, default: new Date() })
  updatedAt!: Date
}

export enum EmoticonActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export class EmoticonLog {
  @prop({ default: EmoticonActionType.READ })
  type!: EmoticonActionType

  @prop({ ref: Emoticon })
  emoticon?: Ref<Emoticon>

  @prop({ required: true, default: new Date() })
  createdAt!: Date

  @prop({ default: null })
  context!: object | null
}

export const EmoticonModel = getModelForClass(Emoticon)
export const EmoticonLogModel = getModelForClass(EmoticonLog)
