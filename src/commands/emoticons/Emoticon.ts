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
    const result = await EmoticonService.getInstance().fetchOrSearch(
      context,
      name
    )

    // if result is empty, then ignore
    const data = result.matched
      ? { file: result.value }
      : `요청하신 ${name} 항목은 찾지 못하였습니다. 데이터베이스를 조회한 결과 유사한 항목 ${
        result.value.length}건이 존재합니다.\n\`${
        (result.value as string[]).join(', ')}\``
    await channel.send(data)
  }
}
