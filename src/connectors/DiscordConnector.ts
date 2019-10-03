import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Client, Message } from 'discord.js'
import { CommandFactory } from '../commands/core/CommandFactory'
import { LoggingQueue } from '../services/LoggingQueue'
import { tryCatch } from '../utils/tryCatch'
import { flatPromiseMap } from '../utils/flatPromiseMap'

export type MessageCallback = (message: Message) => Promise<any>

export class DiscordConnector {
  private client = new Client()

  constructor () {
    LoggingQueue.debugSubject.pipe(
      flatPromiseMap(async value => {
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
      LoggingQueue.debugSubject.next([`${
        format(new Date(), 'yyyy년 MM월 dd일 T HH시 mm분, ', { locale: ko })
      } 작동을 시작했습니다.`])
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
    await this.client.login()
  }
}
