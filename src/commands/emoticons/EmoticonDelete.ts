import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { emoticonNameParser } from '../../parsers/Emoticon'
import { presentDeleteEmoticon } from '../../presenters/Emoticon'

@CommandDefinition()
export class EmoticonDelete extends BasePresentedCommand {
  commands: string[] = ['삭제']
  argsParser: ArgumentParser = emoticonNameParser
  presenter: Presenter = presentDeleteEmoticon
}
