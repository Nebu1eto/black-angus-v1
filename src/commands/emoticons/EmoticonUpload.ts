import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { emoticonUrlParser } from '../../parsers/Emoticon'
import { presentUploadEmoticon } from '../../presenters/Emoticon'

@CommandDefinition()
export class EmoticonUpload extends BasePresentedCommand {
  commands: string[] = ['추가']
  argsParser: ArgumentParser = emoticonUrlParser
  presenter: Presenter = presentUploadEmoticon
}
