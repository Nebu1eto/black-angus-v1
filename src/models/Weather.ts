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
