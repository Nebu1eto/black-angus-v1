import { Message } from 'discord.js'

export enum CommandType {
  ADMIN_COMMANDS,
  FEATURE_COMMANDS,
  VARIABLE_COMMANDS
}

export interface ICommand {
  type: ICommand,
  prefix: string,
  keyword?: string,
  action: (context: Message) => Promise<void>
}
