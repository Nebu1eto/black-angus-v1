import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { presentDuplicateEmoticon } from '../../presenters/Emoticon'

@CommandDefinition()
export class EmoticonDuplicate extends BasePresentedCommand {
  commands: string[] = ['복제']
  argsParser: ArgumentParser = ({ content }) => {
    const [_, name, target] = content.split(' ')
    return { name, target }
  }

  presenter: Presenter = presentDuplicateEmoticon
}
