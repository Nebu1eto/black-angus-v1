import { DiscordConnector } from './connectors/DiscordConnector'
import { Promise as Bluebird } from 'Bluebird'
import { initializeCommands } from './core/initializeCommands'
import { connectDatabase } from './utils/connectDatabase'
import { BOT_CONFIG } from './configs/IConfigurations'
import { EmoticonService } from './services/EmoticonService'
import { LoggingQueue } from './services/LoggingQueue'

// Install Bluebird Polyfill.
global.Promise = Bluebird

class BlackAngusBot {
  private discord: DiscordConnector = new DiscordConnector()

  async start () {
    await connectDatabase()
    await initializeCommands()
    await this.discord.setupDiscordConnector()

    if (BOT_CONFIG.EMOTICON_ENABLED) {
      await EmoticonService.getInstance().initialize()
    }
  }
}

(async () => {
  const botApp = new BlackAngusBot()
  await botApp.start()
})().catch((err) => {
  // process manager will resurrect it. ;)
  console.error(err)
  LoggingQueue.errorSubject.next({
    error: err, time: new Date()
  })
})
