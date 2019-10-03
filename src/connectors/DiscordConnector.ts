import debug from 'debug'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Client, Message, TextChannel, RichEmbed } from 'discord.js'
import { BOT_CONFIG } from '../configs/IConfigurations'
import { CommandFactory } from '../core/CommandFactory'
import { LoggingQueue } from '../services/LoggingQueue'
import { flatPromiseMap } from '../utils/flatPromiseMap'
import { tryCatch } from '../utils/tryCatch'

export type MessageCallback = (message: Message) => Promise<any>

export class DiscordConnector {
  private static debugLogger = debug('Debug Channel')
  private static errorLogger = debug('Error Channel')

  private client = new Client()

  constructor () {
    DiscordConnector.debugLogger.enabled = true
    DiscordConnector.errorLogger.enabled = true

    LoggingQueue.debugSubject.pipe(
      flatPromiseMap(async messages => {
        messages.forEach(message => DiscordConnector.debugLogger(message))
        if (!BOT_CONFIG.DEBUG_HISTORY_TO_CHANNEL) return

        // find channel and send!
        const channels: TextChannel[] = this.client.channels
          .filter(ch => ch.type === 'text').array() as TextChannel[]
        const channel: TextChannel | undefined = channels
          .find(ch => ch.name === BOT_CONFIG.DEBUG_HISTORY_OR_ERROR_CHANNEL)

        if (!channel) return
        await channel.send(messages.join('\n'))
      })
    ).subscribe()
    LoggingQueue.errorSubject.pipe(
      flatPromiseMap(async ({ time, error, context }) => {
        const timeStr = `[${format(time, 'yyyy. MM. dd. a hh:mm:ss', {
          locale: ko
        })}]`
        const messages = [
          // Need to Know Context and Time
          `${timeStr} <${context.author.username}#${context.author.discriminator}> ${
            context.content
          }`,

          // Error Title, Stacktrace
          `${error.message}`,
          `${error.stack}`
        ]
        messages.forEach(message => DiscordConnector.errorLogger(message))
        if (!BOT_CONFIG.DEBUG_ERROR_TO_CHANNEL) return

        // find channel and send!
        const channels: TextChannel[] = this.client.channels
          .filterArray(ch => ch.type === 'text') as TextChannel[]
        const channel: TextChannel | undefined = channels
          .find(ch => ch.name === BOT_CONFIG.DEBUG_HISTORY_OR_ERROR_CHANNEL)

        if (!channel) return

        const attach = new RichEmbed()
          .setColor('red')
          .setTitle('Runtime Error')
          .setDescription(messages[0])
          .addField('Title', messages[1])
          // Be careful for Discord API's Limitation.
          .addField('Stacktrace', messages[2].substring(0, 1024))
          .addBlankField()
          .setFooter('Alert from Black Angus Bot')

        await channel.send(attach)
      })
    ).subscribe()
  }

  // Initialize Discord's on Message
  async setupDiscordConnector () {
    this.client.once('ready', () => {
      LoggingQueue.debugSubject.next([`[${
        format(new Date(), 'yyyy. MM. dd. a hh:mm]', { locale: ko })
      } 봇 작동을 시작했습니다.`])
    })

    this.client.on('message', async (message) => {
      const [error] = await tryCatch(CommandFactory.getInstance().process(message))
      if (error) {
        LoggingQueue.errorSubject.next({
          error, time: new Date(), context: message
        })
      }
    })

    // TODO: Put token in here.
    await this.client.login(BOT_CONFIG.DISCORD_TOKEN)
  }
}
