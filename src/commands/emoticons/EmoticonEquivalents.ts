import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { emoticonNameParser } from '../../parsers/Emoticon'
import { presentGetEquivalentsEmoticon } from '../../presenters/Emoticon'

@CommandDefinition()
export class EmoticonEquivalents extends BasePresentedCommand {
  commands: string[] = ['동의', '동의어']
  argsParser: ArgumentParser = emoticonNameParser
  presenter: Presenter = presentGetEquivalentsEmoticon
}
