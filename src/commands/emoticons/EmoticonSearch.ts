import { CommandDefinition } from '../../core/CommandFactory'
import { ICommand, CommandType } from '../../core/ICommand'
import { Message } from 'discord.js'
import { BOT_CONFIG } from '../../configs/IConfigurations'
import { EmoticonService } from '../../services/EmoticonService'

@CommandDefinition()
export class EmoticonSearch implements ICommand {
  type: CommandType = CommandType.FEATURE_COMMANDS
  prefix: string = '!'

  async action (context: Message) {
    const { content, channel } = context
    if (!content.startsWith('!검색') || !BOT_CONFIG.EMOTICON_ENABLED) {
      return
    }

    const [_, name] = content.split(' ')
    const result = await EmoticonService.getInstance().search(
      context,
      name
    )

    // if result is empty, then ignore
    const data = `데이터베이스를 조회한 결과, 요청하신 '${name}' 키워드를 포함하는 항목 ${
      result.length
    }건이 존재합니다.${
      result.length > 0
        ? `\n - \`${(result.map(emoticon => emoticon.name)).join('\`, \`')}\``
        : ''
    }`

    await channel.send(data)
  }
}
