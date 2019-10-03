import { ICommand } from './ICommand'
import { Message } from 'discord.js'

export function CommandDefinition (value: ICommand) {
  CommandFactory.getInstance().addCommand(value)
}

export class CommandFactory {
  private static instance: CommandFactory
  private commands: Set<ICommand> = new Set()

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

  public async process (context: Message) {
    
  }
}
