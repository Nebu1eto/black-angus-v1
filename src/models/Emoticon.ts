import { prop, getModelForClass, Ref } from '@typegoose/typegoose'

export class Emoticon {
  @prop({ required: true, minlength: 1, maxlength: 10 })
  name!: string

  @prop({ default: [] })
  equivalents: string[] = []

  @prop({ required: true })
  path!: string

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

export class EmoticonLog {
  @prop({ default: EmoticonActionType.READ })
  type!: EmoticonActionType

  @prop({ ref: Emoticon })
  emoticon?: Ref<Emoticon>

  @prop({ default: new Date() })
  createdAt!: Date

  @prop({ default: '' })
  context!: string
}

// for search emoticon lists more fast.
export class EmoticonName {
  @prop({ required: true })
  name!: string
}

export const EmoticonModel = getModelForClass(Emoticon)
export const EmoticonLogModel = getModelForClass(EmoticonLog)
export const EmoticonNameModel = getModelForClass(EmoticonName)
