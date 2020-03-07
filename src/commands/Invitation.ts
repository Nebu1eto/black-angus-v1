import { CommandDefinition } from '../core/CommandFactory'
import { ICommand, CommandType } from '../core/ICommand'
import { Message, PartialMessage } from 'discord.js'
import { BOT_CONFIG } from '../configs/IConfigurations'

@CommandDefinition()
export class Invitation implements ICommand {
  type: CommandType = CommandType.ADMIN_COMMANDS
  prefix: string = BOT_CONFIG.DEBUG_EXECUTION ? '.' : '!'

  async action (context: Message | PartialMessage) {
    const { content, channel } = context
    if (!content?.includes(this.prefix + '초대')) {
      return
    }

    await channel?.send(
      'https://discordapp.com/oauth2/authorize?' +
        `client_id=${BOT_CONFIG.DISCORD_CLIENT_ID}` +
        '&scope=bot&permissions=201444416'
    )
  }
}
