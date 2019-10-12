import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { presentListEmoticon } from '../../presenters/Emoticon'

@CommandDefinition()
export class EmoticonList extends BasePresentedCommand {
  commands: string[] = ['목록']
  argsParser: ArgumentParser = () => ({})
  presenter: Presenter = presentListEmoticon
}
