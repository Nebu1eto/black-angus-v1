import { Presenter } from '../core/BasePresentedCommand'
import WeatherService from '../services/WeatherService'

export const presentGetRiverTemperature: Presenter = async () => {
  const result = await WeatherService.getRiverTemp()
  if (!result) return ['구리, 양평, 가평 측정소를 기준으로 현재 수온을 가져올 수 없었습니다.']

  const [time, place, temperature] = result
  return [`${place} 측정소를 기준으로 ${time} 한강의 수온은 ${temperature}도입니다.`]
}
