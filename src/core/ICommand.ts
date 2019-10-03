import { Message } from 'discord.js'

export enum CommandType {
  ADMIN_COMMANDS = 'ADMIN_COMMANDS',
  FEATURE_COMMANDS = 'FEATURE_COMMANDS',
  VARIABLE_COMMANDS = 'VARIABLE_COMMANDS'
}

export interface ICommand {
  type: CommandType,
  prefix: string,
  action: (context: Message) => Promise<void>
}
