import debug from 'debug'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Client, Message } from 'discord.js'
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
      flatPromiseMap(async value => {
        value.forEach(str => DiscordConnector.debugLogger(str))
        // TODO: Implement Logging to Debug Channel
        return
      })
    ).subscribe()
    LoggingQueue.errorSubject.pipe(
      flatPromiseMap(async ({ time, error, context }) => {
        // TODO: Implement Logging to Error Channel
        return
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
