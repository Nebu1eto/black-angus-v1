import { Presenter, KeyValueString } from '../core/BasePresentedCommand'
import WeatherService from '../services/WeatherService'
import { BOT_CONFIG } from '../configs/IConfigurations'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { RichEmbed } from 'discord.js'
import { IAQIField } from '../models/Weather'

export const presentGetRiverTemperature: Presenter = async () => {
  const result = await WeatherService.getRiverTemp()
  if (!result) {
    return [
      new RichEmbed()
        .setColor('RED')
        .setTitle('한강 수온')
        .setDescription('구리, 양평, 가평 측정소를 기준으로 현재 수온을 가져올 수 없었습니다.')
    ]
  }

  const { time, data } = result
  let embed = new RichEmbed()
    .setColor('DARK_PURPLE')
    .setTitle('한강 수온')
    .setFooter(`${time} 기준 데이터입니다.`)

  for (const [ place, temperature ] of data) {
    embed = embed.addField(`${place} 측정소`, temperature, true)
  }

  return [ embed ]
}

export const presentGetWeather: Presenter = async (map: KeyValueString) => {
  const { keyword } = map

  const location = await WeatherService.getLocation(keyword, BOT_CONFIG.GOOGLE_API_KEY)
  if (!location) {
    return [`구글에서 \`${keyword}\`이라는 위치를 찾을 수 없었습니다.`]
  }

  const airResult = await WeatherService.getAQIData(
    location.lat,
    location.lng,
    BOT_CONFIG.WAQI_API_KEY
  )
  if (!airResult) {
    return [
      `AQI 서비스에서 \`${keyword}\` 위치의 대기 데이터를 찾을 수 없었습니다.`
    ]
  }

  type AQIFields = 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co' | 'temp' | 'pressure' | 'wind' | 'humidity'
  const fieldMap: { [key in AQIFields]: string } = {
    pm25: 'PM2.5',
    pm10: 'PM10',
    o3: '오존(ozone)',
    no2: '이산화질소(Nitrogen Dioxide)',
    so2: '이산화황(Sulphur Dioxide)',
    co: '일산화탄소(Carbon Monoxide)',
    temp: '기온',
    pressure: '기압',
    wind: '풍량',
    humidity: '습도'
  }

  const description = WeatherService.getAQIDescription(airResult.index)
  let attach = new RichEmbed()
    .setColor('DARK_PURPLE')
    .setTitle('AQI Result')
    .setDescription(
      `${airResult.index} - ${description}`
    )
    .setFooter(
      `${format(airResult.time, 'MM월 dd일 a hh시 mm분', {
        locale: ko
      })} 기준 ${
        airResult.name ? airResult.name : location.formattedAddress
      } 측정소의 데이터입니다.`
    )

  const keys = Object.keys(fieldMap) as Array<AQIFields>
  for (const field of keys) {
    if (!airResult.hasOwnProperty(field)) continue
    const result = airResult[field] as IAQIField
    attach = attach.addField(
      fieldMap[field],
      `현재 ${result.current}, 최대 ${result.max}, 최소 ${result.min}`,
      true
    )
  }

  return [attach]
}
