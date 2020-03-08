import { Message, PartialMessage } from 'discord.js'
import _ from 'lodash'
import { LoggingQueue } from '../services/LoggingQueue'
import { CommandType, ICommand } from './ICommand'
import { ko } from 'date-fns/locale'
import { format } from 'date-fns'

export function CommandDefinition () {
  return (Command: new () => ICommand) => {
    CommandFactory.getInstance().addCommand(new Command())
  }
}

export class CommandFactory {
  private static instance: CommandFactory
  private readonly commands: Set<ICommand> = new Set()

  private constructor () {}

  static getInstance (): CommandFactory {
    if (!CommandFactory.instance) {
      CommandFactory.instance = new CommandFactory()
    }

    return CommandFactory.instance
  }

  public addCommand (command: ICommand) {
    this.commands.add(command)
  }

  public async process (context: Message | PartialMessage) {
    // 1. check message's prefix
    const matched = _.chain(Array.from(this.commands.values()))
      .map(command => command.prefix)
      .union()
      .map(prefix => context.content?.startsWith(prefix))
      .some()
      .value()
    if (!matched) return

    // 2. Log Debug Data
    LoggingQueue.debugSubject.next({
      title: '메세지 로그',
      message: `[${format(new Date(), 'yyyy. MM. dd. a hh:mm:ss', { locale: ko })}] <${
        context.author?.username
      }#${context.author?.discriminator}> ${context.content}`,
      context
    })

    // 3. Run Commands
    const types = Object.values(CommandType)
    const commandsAsTypes = (type: CommandType) => {
      return _.chain(Array.from(this.commands.values()))
        .filter(command => command.type === type)
        .value()
    }

    const commands = _.zipObject(types as string[],
      Object.values(types).map(type => commandsAsTypes(type)))

    // 3-1. Run Administrator Commands First.
    // 3-2. Run Features Command Next.
    // 3-3. Run Variable Command at Last.
    await Promise.all(commands[CommandType.ADMIN_COMMANDS].map(command => command.action(context)))
      .then(() => Promise.all(commands[CommandType.FEATURE_COMMANDS].map(command => command.action(context))))
      .then(() => Promise.all(commands[CommandType.VARIABLE_COMMANDS].map(command => command.action(context))))
      .catch(error => {
        // 3-failure: Log Error Data
        LoggingQueue.errorSubject.next({
          error, context, time: new Date()
        })
      })
  }
}
