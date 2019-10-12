import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { emoticonUrlParser } from '../../parsers/Emoticon'
import { presentUploadEmoticon } from '../../presenters/Emoticon'

@CommandDefinition()
export class EmoticonUpdate extends BasePresentedCommand {
  commands: string[] = ['수정']
  argsParser: ArgumentParser = emoticonUrlParser
  presenter: Presenter = presentUploadEmoticon
}
