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

export const BOT_CONFIG: IConfigurations = require(
  (process.env.CONFIG_FILE as string).startsWith('.')
    ? path.join(process.cwd(), process.env.CONFIG_FILE as string)
    : (process.env.CONFIG_FILE as string)
)
