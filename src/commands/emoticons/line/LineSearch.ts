import { ArgumentParser, BasePresentedCommand, Presenter } from '../../../core/BasePresentedCommand'
import { CommandDefinition } from '../../../core/CommandFactory'
import { presentSearchLineEmoticon } from '../../../presenters/Linecon'

@CommandDefinition()
export class LineEmoticonSearch extends BasePresentedCommand {
  commands: string[] = ['라인검색']

  argsParser: ArgumentParser = ({ content }) => {
    const [_, keyword, page, limit] = content?.split(' ')
    return { keyword, page, limit }
  }

  presenter: Presenter = presentSearchLineEmoticon
}
