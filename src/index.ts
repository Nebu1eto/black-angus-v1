class BlackAngusBot {
  static CONFIGURATION: IConfigurations = require(process.env.CONFIG_FILE as string)

  async start () {
    // ...
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
