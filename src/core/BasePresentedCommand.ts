import _ from 'lodash'
import { ICommand, CommandType } from './ICommand'
import { Message, MessageOptions, RichEmbed, Attachment } from 'discord.js'

export type PresentedValue =
  | [any]
  | [any, MessageOptions | RichEmbed | Attachment | undefined]

export type KeyValueString = { [key: string]: string }

export type Presenter = (
  map: KeyValueString,
  context: Message
) => Promise<PresentedValue>

export type ArgumentParser = (context: Message) => KeyValueString

export abstract class BasePresentedCommand implements ICommand {
  type: CommandType = CommandType.FEATURE_COMMANDS
  prefix: string = '!'

  flags: boolean[] = []
  abstract commands: string[]
  abstract argsParser: ArgumentParser
  abstract presenter: Presenter

  async action (context: Message): Promise<void> {
    const { content, channel } = context

    // 1. return by flag
    if (_.some(this.flags.map(flag => !flag))) {
      return
    }

    // 2. return by keyword
    if (this.commands.length !== 0 && _.every(this.commands.map(
      command => content.indexOf(this.prefix + command) === -1
    ))) {
      return
    }

    // 3. get arguments with parser and return presented value
    const args = this.argsParser(context)
    await channel.send(...(await this.presenter(args, context)))
  }
}
