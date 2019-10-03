import { prop, getModelForClass, Ref } from '@typegoose/typegoose'

export class Emoticon {
  @prop({ required: true, minlength: 1, maxlength: 10 })
  name!: string

  @prop({ default: [] })
  equivalent: string[] = []

  @prop({ required: true })
  path!: string

  @prop({ required: true, default: new Date() })
  createdAt!: Date

  @prop({ required: true, default: new Date() })
  updatedAt!: Date
}

export enum EmotionActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export class EmoticonLog {
  @prop({ default: EmotionActionType.READ })
  type!: EmotionActionType

  @prop({ ref: Emoticon })
  emoticon?: Ref<Emoticon>

  @prop({ required: true, default: new Date() })
  createdAt!: Date

  @prop({ default: '' })
  context!: string
}

export const EmoticonModel = getModelForClass(Emoticon)
export const EmoticonLogModel = getModelForClass(EmoticonLog)
