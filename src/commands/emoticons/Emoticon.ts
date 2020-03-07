import _ from 'lodash'
import { CommandDefinition } from '../../core/CommandFactory'
import { CommandType } from '../../core/ICommand'
import { Message, PartialMessage } from 'discord.js'
import { BOT_CONFIG } from '../../configs/IConfigurations'
import { BasePresentedCommand, ArgumentParser, Presenter } from '../../core/BasePresentedCommand'
import { presentFetchEmoticon } from '../../presenters/Emoticon'
import { presentFetchLinecon } from '../../presenters/Linecon'

@CommandDefinition()
export class Emoticon extends BasePresentedCommand {
  flags = BOT_CONFIG.EMOTICON_ENABLED || BOT_CONFIG.LINECON_ENABLED
  commands: string[] = []

  argsParser: ArgumentParser = ({ content }) => ({
    name: content?.substring(1, content?.length) ?? ''
  })

  presenter: Presenter = presentFetchEmoticon

  type: CommandType = CommandType.VARIABLE_COMMANDS

  prefix: string = BOT_CONFIG.DEBUG_EXECUTION ? '$' : '~'

  async action (context: Message | PartialMessage) {
    if (!context.content!.startsWith(this.prefix)) return

    await super.action(context!, this.presenter)
    await super.action(context!, presentFetchLinecon)
  }
}
