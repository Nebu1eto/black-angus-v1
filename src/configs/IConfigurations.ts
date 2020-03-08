import path from 'path'

export interface IConfigurations {
  DEBUG_EXECUTION: boolean

  DEBUG_HISTORY_TO_CHANNEL: boolean // true
  DEBUG_ERROR_TO_CHANNEL: boolean // true
  DEBUG_HISTORY_OR_ERROR_CHANNEL: string // "log_channel"
  DISCORD_TOKEN: string
  DISCORD_CLIENT_ID: string
  MONGODB_ADDRESS: string

  EMOTICON_ENABLED: boolean
  EMOTICON_FILE_PATH: string // must be an absolute path

  LINECON_ENABLED: boolean
  LINECON_FILE_PATH: string

  GOOGLE_API_KEY: string
  WAQI_API_KEY: string
}

export const BOT_CONFIG: IConfigurations = (() => {
  const basePath = process.env.RAW_JSON_FILE ?? './env/config.json'
  const rawBasePath = basePath.startsWith('.') ? path.join(process.cwd(), basePath) : basePath
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(rawBasePath) as IConfigurations
})()
