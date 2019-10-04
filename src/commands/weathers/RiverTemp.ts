import axios from 'axios'
import cheerio from 'cheerio'
import { Message } from 'discord.js'
import _ from 'lodash'
import { CommandDefinition } from '../../core/CommandFactory'
import { CommandType, ICommand } from '../../core/ICommand'

@CommandDefinition()
export class RiverTemp implements ICommand {
  type: CommandType = CommandType.ADMIN_COMMANDS
  prefix: string = '!'

  private link = 'http://www.koreawqi.go.kr/wQSCHomeLayout_D.wq?action_type=T'

  async action (context: Message) {
    const { content, channel } = context
    if (_.every(['!자살', '!한강', '!한강수온', '!퐁당'].map(
      item => content.indexOf(item) === -1
    ))) return

    const { data } = await axios({
      method: 'GET',
      url: this.link,
      responseType: 'text'
    })
    const $ = cheerio.load(data)

    const baseTimeCode = $('.data script')[0].children[0].data!
      .split('\t')
      .join('')
      .split('\n')[1]
      .split('"')
      .filter(elem => !isNaN(parseInt(elem, 0)))
    const temperature = $('.site_S01004 td.avg1')
      .text()
      .split('\t')
      .join('')
      .split('\n')
      .join('')
      .split(' ')
      .join('')

    console.log(baseTimeCode[0])
    await channel.send(
      `구리 측정소를 기준으로 ${
        baseTimeCode[0].substring(4, 6)
      }월 ${
        baseTimeCode[0].substring(6, 8)
      }일 ${
        baseTimeCode[1]
      }시 한강의 수온은 ${temperature}도입니다.`
    )
  }
}
