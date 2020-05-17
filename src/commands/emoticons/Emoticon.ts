import { BOT_CONFIG } from '../../configs/IConfigurations'
import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { CommandType } from '../../core/ICommand'
import { presentFetchEmoticon } from '../../presenters/Emoticon'

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
}
