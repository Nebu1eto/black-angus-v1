import _ from 'lodash'
import { ICommand, CommandType } from './ICommand'
import { Message, MessageOptions, MessageEmbed, MessageAttachment, PartialMessage } from 'discord.js'
import { BOT_CONFIG } from '../configs/IConfigurations'

export type PresentedValue =
  | [any, MessageOptions | MessageEmbed | MessageAttachment | undefined]
  | any[]

export type KeyValueString = { [key: string]: string }

export type Presenter = (
  map: KeyValueString,
  context: Message | PartialMessage
) => Promise<PresentedValue | undefined>

export type ArgumentParser = (context: Message | PartialMessage) => KeyValueString

export abstract class BasePresentedCommand implements ICommand {
  type: CommandType = CommandType.FEATURE_COMMANDS
  prefix: string = BOT_CONFIG.DEBUG_EXECUTION ? '.' : '!'

  flags: boolean = true
  abstract commands: string[]
  abstract argsParser: ArgumentParser
  abstract presenter: Presenter

  async action (context: Message | PartialMessage, presenter: Presenter = this.presenter): Promise<void> {
    const { content, channel } = context

    // 1. return by flag
    if (!this.flags) {
      return
    }

    // 2. return by keyword
    if (this.commands.length !== 0 && _.every(this.commands.map(
      command => content?.indexOf(this.prefix + command) === -1
    ))) {
      return
    }

    // 3. get arguments with parser and return presented value
    const args = this.argsParser(context!)
    const presented = await presenter(args, context!)
    if (presented && presented.length > 0) await channel?.send(...presented)
  }
}
