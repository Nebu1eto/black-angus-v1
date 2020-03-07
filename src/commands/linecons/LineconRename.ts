import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { presentRenameLinecon } from '../../presenters/Linecon'

@CommandDefinition()
export class LineconRename extends BasePresentedCommand {
  commands: string[] = ['라인변경']

  argsParser: ArgumentParser = ({ content }) => {
    const [_, newKeyword, keyword] = content?.split(' ')
    return { keyword, newKeyword }
  }

  presenter: Presenter = presentRenameLinecon
}
