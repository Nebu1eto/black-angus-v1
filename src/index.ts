import { DiscordConnector } from './connectors/DiscordConnector'

class BlackAngusBot {
  private discord: DiscordConnector = new DiscordConnector()

  start () {
    return this.discord.setupDiscordConnector()
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
