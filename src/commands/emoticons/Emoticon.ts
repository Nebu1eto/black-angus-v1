import { CommandDefinition } from '../../core/CommandFactory'
import { ICommand, CommandType } from '../../core/ICommand'
import { Message } from 'discord.js'
import { BOT_CONFIG } from '../../configs/IConfigurations'
import { EmoticonService } from '../../services/EmoticonService'

@CommandDefinition()
export class Emoticon implements ICommand {
  type: CommandType = CommandType.VARIABLE_COMMANDS
  prefix: string = '~'

  async action (context: Message) {
    const { content, channel } = context
    if (!content.startsWith(this.prefix) || !BOT_CONFIG.EMOTICON_ENABLED) {
      return
    }

    const name = content.substring(1, content.length)
    const file = await EmoticonService.getInstance().fetch(
      context,
      name
    )

    await channel.send(
      file ? { file } : `'${name}' 이름의 이모티콘을 찾을 수 없습니다.`
    )
  }
}
