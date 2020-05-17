import { Promise as Bluebird } from 'bluebird'
import { BOT_CONFIG } from './configs/IConfigurations'
import { DiscordConnector } from './connectors/DiscordConnector'
import { initializeCommands } from './core/initializeCommands'
import EmoticonService from './services/EmoticonService'
import LineEmoticonService from './services/LineEmoticonService'
import { LoggingQueue } from './services/LoggingQueue'
import { connectDatabase } from './utils/connectDatabase'

// Install Bluebird Polyfill.
global.Promise = Bluebird

class BlackAngusBot {
  private readonly discord: DiscordConnector = new DiscordConnector()

  async start () {
    await connectDatabase()
    await initializeCommands()
    await this.discord.setupDiscordConnector()

    if (BOT_CONFIG.EMOTICON_ENABLED) {
      await EmoticonService.initialize()
    }

    if (BOT_CONFIG.LINECON_ENABLED) {
      await LineEmoticonService.initialize()
    }
  }
}

(async () => {
  const botApp = new BlackAngusBot()
  await botApp.start()
})().catch((err) => {
  console.error(err)
  LoggingQueue.errorSubject.next({
    error: err, time: new Date()
  })

  // process manager will resurrect it. ;)
  process.exit(1)
})
