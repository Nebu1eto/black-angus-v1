import axios, { AxiosRequestConfig } from 'axios'
import charset from 'charset'
import cheerio from 'cheerio'
import iconv from 'iconv-lite'
import _ from 'lodash'
import querystring from 'querystring'
import { IAirRecord, IAQIField } from '../models/Weather'
import { LoggingQueue } from './LoggingQueue'

const WeatherService = {
  getRiverTemp: async () => {
    const { data, headers } = await axios({
      method: 'GET',
      url: 'http://www.koreawqi.go.kr/wQSCHomeLayout_D.wq?action_type=T',
      responseType: 'arraybuffer',
      responseEncoding: null
    } as AxiosRequestConfig)

    const encoding = charset(headers, data)
    const body = iconv.decode(data, encoding ? encoding : 'euc-kr')
    const $ = cheerio.load(body)

    const baseTimeCode = $('.data script')[0]
      .children[0].data!.split('\t')
      .join('')
      .split('\n')[1]
      .split('"')
      .filter(elem => !isNaN(parseInt(elem, 0)))
    const time = `${baseTimeCode[0].substring(4, 6)}월 ${
      baseTimeCode[0].substring(6, 8)}일 ${baseTimeCode[1]}시`

    const candidate1 = $('.site_S01004 td.avg1')    // 구리
    const candidate2 = $('.site_S01025 td.avg1')    // 양평
    const candidate3 = $('.site_S01001 td.avg1')    // 가평
    const getTemperature = (candidate: Cheerio) =>
      candidate
        .text()
        .split('\t')
        .join('')
        .split('\n')
        .join('')
        .split(' ')
        .join('')

    if (_.every([candidate1, candidate2, candidate3],
      candidate => candidate.length === 0)) return undefined
    return {
      time,
      data: [
        ['구리', getTemperature(candidate1)],
        ['양평', getTemperature(candidate2)],
        ['가평', getTemperature(candidate3)]
      ]
    }
  },

  getLocation: async (address: string, key: string) => {
    const query = querystring.stringify({
      region: 'kr', key, address
    })

    const { data } = await axios({
      method: 'GET',
      url: `https://maps.googleapis.com/maps/api/geocode/json?${query}`,
      responseType: 'json',
      headers: {
        'Accept-Language': 'ko-KR'
      }
    })

    if (data.status !== 'OK' || data.results.length <= 0) {
      return undefined
    }

    LoggingQueue.debugSubject.next([
      'Geocoding Results',
      JSON.stringify(data),
      true
    ])

    const formattedAddress = data.results[0].formatted_address
    const lat = data.results[0].geometry.location.lat
    const lng = data.results[0].geometry.location.lng

    return { formattedAddress, lat, lng }
  },

  getAQIData: async (lat: number, lng: number, token: string) => {
    const fakeUA =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/79.0.3919.0 Safari/537.36'

    const resp1 = (await axios({
      method: 'GET',
      url: `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${token}`,
      responseType: 'json',
      headers: {
        'Accept-Language': 'ko-KR'
      }
    })).data

    if (!resp1.data.idx) return undefined
    const index = resp1.data.idx

    const resp2 = (await axios({
      method: 'GET',
      url: `https://api.waqi.info/api/feed/@${index}/obs.en.json?token=${token}`,
      responseType: 'json',
      headers: {
        'User-Agent': fakeUA
      }
    })).data

    if (resp2.rxs.obs[0].status !== 'ok') return undefined
    const data = resp2.rxs.obs[0].msg

    const map = {
      pm25: 'pm25',
      pm10: 'pm10',
      o3: 'o3',
      no2: 'no2',
      so2: 'so2',
      co: 'co',
      t: 'temp',
      w: 'wind',
      h: 'humidity',
      p: 'pressure'
    }

    type PartialAQIField = { [str in keyof typeof map]: IAQIField }
    const aqi: PartialAQIField = data.iaqi
      .map((elem: any) => {
        const key = map[elem.p as keyof typeof map]
        const [current, min, max]: [number, number, number] = elem.v
        return { [key]: { current, min, max } as IAQIField }
      })
      .reduce((acc: PartialAQIField, val: PartialAQIField) => {
        return { ...acc, ...val }
      })

    return Object.assign(aqi, {
      name: _.get(data, 'i18n.name.ko'),
      index: data.aqi,
      time: new Date(
        _.get(data, 'time.utc.v', new Date().getTime() / 1000) * 1000
      )
    }) as IAirRecord
  },

  getAQIDescription: (aqi: number) => {
    if (aqi > 300) {
      return (
        '위험(환자군 및 민감군에게 응급 조치가 발생되거나, ' +
        '일반인에게 유해한 영향이 유발될 수 있는 수준)'
      )
    } else if (aqi > 200) {
      return (
        '매우 나쁨(환자군 및 민감군에게 급성 노출시 심각한 영향 유발, ' +
        '일반인도 약한 영향이 유발될 수 있는 수준)'
      )
    } else if (aqi > 150) {
      return (
        '나쁨(환자군 및 민감군[어린이, 노약자 등]에게 유해한 영향 유발, ' +
        '일반인도 건강상 불쾌감을 경험할 수 있는 수준)'
      )
    } else if (aqi > 100) {
      return '민감군 영향(환자군 및 민감군에게 유해한 영향이 유발될 수 있는 수준)'
    } else if (aqi > 50) {
      return '보통(환자군에게 만성 노출시 경미한 영향이 유발될 수 있는 수준)'
    } else {
      return '좋음(대기오염 관련 질환자군에서도 영향이 유발되지 않을 수준)'
    }
  }
}

export default WeatherService
