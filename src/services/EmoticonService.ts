import fs from 'fs'
import util from 'util'
import { BOT_CONFIG } from '../configs/IConfigurations'
import { tryCatch } from '../utils/tryCatch'

const mkdir = util.promisify(fs.mkdir)
const stat = util.promisify(fs.stat)

export class EmoticonService {
  private static instance: EmoticonService

  private constructor () {}

  static getInstance (): EmoticonService {
    if (!EmoticonService.instance) {
      EmoticonService.instance = new EmoticonService()
    }

    return EmoticonService.instance
  }

  public async initialize () {
    const [err, result] = await tryCatch(stat(BOT_CONFIG.EMOTICON_FILE_PATH))
    if (err) {
      await mkdir(BOT_CONFIG.EMOTICON_FILE_PATH)
      return
    }

    if (result && !result.isDirectory()) {
      throw new Error('Emoticon Path must be folder or empty.')
    }
  }

  // TODO: upload, patch, delete, search (direct, simillar one)
}