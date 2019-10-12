import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { emoticonNameParser } from '../../parsers/Emoticon'
import { presentSearchEmoticon } from '../../presenters/Emoticon'

@CommandDefinition()
export class EmoticonSearch extends BasePresentedCommand {
  commands: string[] = ['검색']
  argsParser: ArgumentParser = emoticonNameParser
  presenter: Presenter = presentSearchEmoticon
}
