import { CommandDefinition } from '../core/CommandFactory'
import { ICommand, CommandType } from '../core/ICommand'
import { Message } from 'discord.js'
import { BOT_CONFIG } from '../configs/IConfigurations'

@CommandDefinition()
export class Invitation implements ICommand {
  type: CommandType = CommandType.ADMIN_COMMANDS
  prefix: string = BOT_CONFIG.DEBUG_EXECUTION ? '.' : '!'

  async action (context: Message) {
    const { content, channel } = context
    if (content.indexOf(this.prefix + '초대') === -1) {
      return
    }

    await channel.send(
      'https://discordapp.com/oauth2/authorize?' +
        `client_id=${BOT_CONFIG.DISCORD_CLIENT_ID}` +
        '&scope=bot&permissions=201444416'
    )
  }
}
