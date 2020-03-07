import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { presentInitializeLineconCategory } from '../../presenters/Linecon'

@CommandDefinition()
export class LineconInitialize extends BasePresentedCommand {
  commands: string[] = ['라인다운']

  argsParser: ArgumentParser = ({ content }) => {
    const [_, id, name] = content?.split(' ')
    return { id, name }
  }

  presenter: Presenter = presentInitializeLineconCategory
}
