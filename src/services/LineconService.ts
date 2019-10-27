// Thanks to Siwon Kim, for Proof of Concept.
import cheerio from 'cheerio'
import fs from 'fs'
import sharp from 'sharp'
import path from 'path'
import util from 'util'
import { BOT_CONFIG } from '../configs/IConfigurations'
import { LineconCategoryModel, LineconModel } from '../models/Linecon'
import { isAnimatedPng } from '../utils/isAnimatedPng'
import apng2gif from '../utils/apng2gif'
import got from 'got'

const appendFile = util.promisify(fs.appendFile)
const mkdir = util.promisify(fs.mkdir)

export default class LineconService {
  static async fetchEmoticon (id: number, name: string) {
    // if already exists return model.
    const prev = await LineconCategoryModel.findOne({ originId: id }).exec()
    if (prev) return prev

    // download and load with parser
    const { body } = await got.get(
      `https://line.me/S/sticker/${id}/?lang=ja&ref=gnsh_stickerDetail`
    )
    const $ = cheerio.load(body)

    // get title and urls
    const title = $('p.mdCMN38Item01Ttl').text()
    const emoticonUrls = (Array.from(
      $('li.mdCMN09Li.FnStickerPreviewItem')
        .map((_, element) => {
          const target = element.attribs['data-preview']
          if (!target) return undefined

          const baseData = JSON.parse(target)
          return baseData.animationUrl
            ? baseData.animationUrl
            : baseData.staticUrl
        })
        .filter(url => url !== undefined)
    ) as unknown) as string[]

    // create folder, and download images
    const folderPath = path.join(BOT_CONFIG.LINECON_FILE_PATH, `${id}`)
    await mkdir(folderPath)
    const category = await LineconCategoryModel.create({
      title, originId: id, name, path: folderPath
    })

    await Promise.all(emoticonUrls.map(async (url, index) => {
      // 1. download original file
      const { body } = await got.get(url, {
        encoding: null,
        retry: 3
      })

      const pngFilePath = path.join(folderPath, `i_${index}.png`)
      const thumbnailPath = path.join(folderPath, `t_${index}.png`)
      const gifFilePath = path.join(folderPath, `i_${index}.gif`)
      await appendFile(pngFilePath, body)

      // 2. check if it is animated png, convert it
      let animated = false
      if (isAnimatedPng(body)) {
        animated = true
        await apng2gif(pngFilePath, gifFilePath, {})
      }

      await sharp(pngFilePath)
        .resize(200, 200)
        .png()
        .toFile(thumbnailPath)

      return LineconModel.create({
        category,
        animated,
        name: `${index}`,
        fullPath: animated ? gifFilePath : pngFilePath,
        thumbnailPath
      })
    }))

    return category
  }
}
