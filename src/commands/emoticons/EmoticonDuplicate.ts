import { CommandDefinition } from '../../core/CommandFactory'
import { ICommand, CommandType } from '../../core/ICommand'
import { Message } from 'discord.js'
import { BOT_CONFIG } from '../../configs/IConfigurations'
import { EmoticonService } from '../../services/EmoticonService'

@CommandDefinition()
export class EmoticonDuplicate implements ICommand {
  type: CommandType = CommandType.FEATURE_COMMANDS
  prefix: string = '!'

  async action (context: Message) {
    const { content, channel } = context
    if (content.indexOf('!복제') === -1 || !BOT_CONFIG.EMOTICON_ENABLED) {
      return
    }

    const [_, name, target] = content.split(' ')
    const result = await EmoticonService.getInstance().duplicate(
      context,
      name,
      target
    )

    await channel.send(result)
  }
}
