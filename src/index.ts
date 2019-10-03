import { DiscordConnector } from './connectors/DiscordConnector'
import { Promise as Bluebird } from 'Bluebird'
import { initializeCommands } from './core/initializeCommands'

// Install Bluebird Polyfill.
global.Promise = Bluebird

class BlackAngusBot {
  private discord: DiscordConnector = new DiscordConnector()

  async start () {
    await initializeCommands()
    await this.discord.setupDiscordConnector()
  }
}

(async () => {
  const botApp = new BlackAngusBot()
  await botApp.start()
})().catch((err) => {
  // process manager will resurrect it. ;)
  console.error(err)
  process.exit(1)
})
