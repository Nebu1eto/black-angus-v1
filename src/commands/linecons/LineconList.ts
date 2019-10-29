import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { presentListLinecon } from '../../presenters/Linecon'

@CommandDefinition()
export class EmoticonList extends BasePresentedCommand {
  commands: string[] = ['라인목록']
  argsParser: ArgumentParser = () => ({})
  presenter: Presenter = presentListLinecon
}
