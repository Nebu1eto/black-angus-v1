import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { presentFetchLineconCategory } from '../../presenters/Linecon'

@CommandDefinition()
export class LineconFetchCategory extends BasePresentedCommand {
  commands: string[] = ['라인확인']

  argsParser: ArgumentParser = ({ content }) => {
    const [_, name] = content?.split(' ')
    return { name }
  }

  presenter: Presenter = presentFetchLineconCategory
}
