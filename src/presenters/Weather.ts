import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MessageEmbed, Message, PartialMessage } from 'discord.js'
import { BOT_CONFIG } from '../configs/IConfigurations'
import { KeyValueString, Presenter } from '../core/BasePresentedCommand'
import { IAQIField } from '../models/Weather'
import WeatherService from '../services/WeatherService'

export const presentGetRiverTemperature: Presenter = async () => {
  const result = await WeatherService.getRiverTemp()
  if (!result) {
    return [
      new MessageEmbed()
        .setColor('RED')
        .setTitle('한강 수온')
        .setDescription('구리, 양평, 가평 측정소를 기준으로 현재 수온을 가져올 수 없었습니다.')
    ]
  }

  const { time, data } = result
  let embed = new MessageEmbed()
    .setColor('DARK_PURPLE')
    .setTitle('한강 수온')
    .setFooter(`${time} 기준 데이터입니다.`)

  for (const [place, temperature] of data) {
    embed = embed.addField(`${place} 측정소`, temperature, true)
  }

  return [embed]
}

export const presentGetAirQuality: Presenter = async (map: KeyValueString, context: Message | PartialMessage) => {
  const { keyword } = map

  const location = await WeatherService.getLocation(keyword, BOT_CONFIG.GOOGLE_API_KEY, context)
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
  let attach = new MessageEmbed()
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

  const keys = Object.keys(fieldMap) as AQIFields[]
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

export const presentGetWeather: Presenter = async (map: KeyValueString, context: Message | PartialMessage) => {
  const { keyword } = map
  const results = await WeatherService.getWeatherFromAWS(keyword, context)
  if (!results || results.length <= 0) {
    return ['검색 결과가 없습니다. 한국 기상청 AWS가 설치된 장소인지 확인해주세요.']
  }

  // sort by score, map only record.
  const embeds = results
    .sort((x, y) => y[0] - x[0])
    .map(([_, record]) => record)
    .map(record => {
      const emoji =
        record.rain.is_raining === 'Rain'
          ? record.temperature && record.temperature < 0
            ? ':snowflake:'
            : ':umbrella:'
          : [21, 22, 23, 0, 1, 2, 3, 4, 5, 6].includes(
              record.observedAt.getHours()
            )
          ? ':crescent_moon:'
          : ':sunny:'

      const rain = ((isRaining: typeof record.rain.is_raining) => {
        switch (isRaining) {
          case 'Rain':
            return `예 (15분: ${record.rain.rain15.toFixed(
              2
            )}mm / 일일: ${record.rain.rainday.toFixed(2)}mm)`
          case 'Clear':
            return '아니오'
          case 'Unavailable':
            return '확인 불가능'
          case 'Unknown':
            return '알 수 없음'
        }
      })(record.rain.is_raining)

      let embed = new MessageEmbed()
        .setTitle('Weather Result from AWS')
        .setColor('ORANGE')
        .setDescription(`[${emoji}] ${record.name} / ${record.address}`)
        .setFooter(
          `${format(record.observedAt, 'yyyy년 MM월 dd일 a hh시 mm분', {
            locale: ko
          })} 기준 측정 자료입니다.`
        )

      embed = embed.addField('강수', rain)
      if (record.temperature) embed = embed.addField('기온', `${record.temperature.toFixed(1)}℃`, true)
      if (record.humidity) embed = embed.addField('습도', `${record.humidity}%`, true)
      if (record.atmospheric) embed = embed.addField('기압', `${record.atmospheric}hPa`, true)
      if (!['No', 'Unavailable'].includes(record.wind1.direction_text)) {
        embed = embed.addField(
          '풍량',
          `${record.wind1.direction_text
            .split('N')
            .join('북')
            .split('S')
            .join('남')
            .split('W')
            .join('서')
            .split('E')
            .join('동')} ${record.wind1.velocity.toFixed(1)}m/s`
        )
      }

      return embed
    })

  for (const embed of embeds) {
    await context.channel?.send(embed)
  }

  return []
}
