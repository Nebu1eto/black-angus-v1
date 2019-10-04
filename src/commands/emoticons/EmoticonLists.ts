import { CommandDefinition } from '../../core/CommandFactory'
import { ICommand, CommandType } from '../../core/ICommand'
import { Message, Attachment } from 'discord.js'
import { BOT_CONFIG } from '../../configs/IConfigurations'
import { EmoticonService } from '../../services/EmoticonService'

@CommandDefinition()
export class EmoticonList implements ICommand {
  type: CommandType = CommandType.FEATURE_COMMANDS
  prefix: string = '!'

  async action (context: Message) {
    const { content, channel } = context
    if (content.indexOf('!목록') === -1 || !BOT_CONFIG.EMOTICON_ENABLED) {
      return
    }

    const result = await EmoticonService.getInstance().getEmoticonLists()
    await channel.send(
      '현재 기준 디시콘 목록입니다.',
      new Attachment(
        Buffer.from(result.sort().join('\n'), 'utf8'),
        'dccon_list.txt'
      )
    )
  }
}
