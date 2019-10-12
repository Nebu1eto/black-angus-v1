import _ from 'lodash'
import { ICommand, CommandType } from './ICommand'
import { Message, MessageOptions, RichEmbed, Attachment } from 'discord.js'

export type Presenter = (map: { [key: string]: string }, context: Message) =>
  Promise<[any, MessageOptions | RichEmbed | Attachment | undefined]>

export type ArgumentParser = (context: Message) => ({ [key: string]: string })

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
    if (_.some(this.flags)) {
      return
    }

    // 2. return by keyword
    if (_.every(this.commands.map(command =>
      content.indexOf(this.prefix + command) === -1
    ))) {
      return
    }

    // 3. get arguments with parser and return presented value
    const args = this.argsParser(context)
    await channel.send(...(await this.presenter(args, context)))
  }
}
