import { getModelForClass, index, prop } from '@typegoose/typegoose'

export interface IAQIField {
  current: number
  min: number
  max: number
}

export interface IAirRecord {
  name?: string
  index: number
  time: Date
  pm25?: IAQIField
  pm10?: IAQIField
  o3?: IAQIField
  no2?: IAQIField
  so2?: IAQIField
  co?: IAQIField
  temp?: IAQIField
  wind?: IAQIField
  humidity?: IAQIField
  pressure?: IAQIField
}

export interface RawAWSResponse {
  observed_at: Date
  records: IWeatherRecord[]
}

export interface IWeatherRecord {
  id: number
  name: string
  height: number
  rain: IRainPartial
  temperature: number
  wind1: IWindPartial
  wind10: IWindPartial
  humidity: number
  atmospheric: number
  address: string
}

export interface IRainPartial {
  is_raining: 'Unavailable' | 'Clear' | 'Unknown' | 'Rain'
  rain15: number
  rain60: number
  rain3h: number
  rain6h: number
  rain12h: number
  rainday: number
}

export interface IWindPartial {
  direction_code: number
  direction_text: string
  velocity: number
}

@index({ observedAt: 1 }, { expireAfterSeconds: 60 * 15 })
export class WeatherRecord {
  @prop({ required: true })
  observedAt!: Date

  @prop()
  name!: string

  @prop()
  height!: number

  @prop()
  rain!: IRainPartial

  @prop()
  temperature?: number

  @prop()
  wind1!: IWindPartial

  @prop()
  wind10!: IWindPartial

  @prop()
  humidity?: number

  @prop()
  atmospheric?: number

  @prop({ required: true })
  address!: string
}

export const WeatherRecordModel = getModelForClass(WeatherRecord)
