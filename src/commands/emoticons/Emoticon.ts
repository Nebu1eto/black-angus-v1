import { CommandDefinition } from '../../core/CommandFactory'
import { CommandType } from '../../core/ICommand'
import { Message } from 'discord.js'
import { BOT_CONFIG } from '../../configs/IConfigurations'
import { BasePresentedCommand, ArgumentParser, Presenter } from '../../core/BasePresentedCommand'
import { presentFetchEmoticon } from '../../presenters/Emoticon'

@CommandDefinition()
export class Emoticon extends BasePresentedCommand {
  flags = [BOT_CONFIG.EMOTICON_ENABLED]
  commands: string[] = []

  argsParser: ArgumentParser = ({ content }) => ({
    name: content.substring(1, content.length)
  })

  presenter: Presenter = presentFetchEmoticon

  type: CommandType = CommandType.VARIABLE_COMMANDS

  prefix: string = '~'

  async action (context: Message) {
    if (!context.content.startsWith(this.prefix)) return
    return super.action(context)
  }
}
