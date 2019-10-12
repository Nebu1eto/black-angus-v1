import axios from 'axios'
import cheerio from 'cheerio'

const WeatherService = {
  getRiverTemp: async () => {
    const { data } = await axios({
      method: 'GET',
      url: 'http://www.koreawqi.go.kr/wQSCHomeLayout_D.wq?action_type=T',
      responseType: 'text'
    })
    const $ = cheerio.load(data)

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

    if (candidate1.length !== 0) return [time, '구리', getTemperature(candidate1)]
    if (candidate2.length !== 0) return [time, '양평', getTemperature(candidate2)]
    if (candidate3.length !== 0) return [time, '가평', getTemperature(candidate3)]
    return undefined
  }
}

export default WeatherService
