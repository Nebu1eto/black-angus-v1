// Thanks to Siwon Kim, for Proof of Concept.
import cheerio from 'cheerio'
import fs from 'fs'
import got from 'got'
import path from 'path'
import sharp from 'sharp'
import { URLSearchParams } from 'url'
import util from 'util'
import { BOT_CONFIG } from '../configs/IConfigurations'
import { Linecon, LineconCategory, LineconCategoryModel, LineconModel, SearchResult } from '../models/Linecon'
import apng2gif from '../utils/apng2gif'
import { isAnimatedPng } from '../utils/isAnimatedPng'
import { tryCatch } from '../utils/tryCatch'

const appendFile = util.promisify(fs.appendFile)
const mkdir = util.promisify(fs.mkdir)
const stat = util.promisify(fs.stat)
const fakeUA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/79.0.3919.0 Safari/537.36'

export default class LineconService {
  public static async initialize () {
    const [err, result] = await tryCatch(stat(BOT_CONFIG.LINECON_FILE_PATH))
    if (err) {
      await mkdir(BOT_CONFIG.LINECON_FILE_PATH)
      return
    }

    if (result && !result.isDirectory()) {
      throw new Error('Emoticon Path must be folder or empty.')
    }
  }

  static async searchEmoticons (keyword: string, page: number = 1, limit: number = 10): Promise<[number, SearchResult[]]> {
    // download and load with parser
    const { body } = await got.get(`https://store.line.me/api/search/sticker`, {
      query: new URLSearchParams([
        ['query', keyword],
        ['offset', `${limit * (page - 1)}`],
        ['limit', `${limit}`],
        ['type', 'ALL'],
        ['includeFacets', 'true']
      ]),
      headers: {
        'User-Agent': fakeUA,
        'X-Requested-With': 'XMLHttpRequest',
        Referrer: `https://store.line.me/search/sticker/ko?q=${encodeURIComponent(
          keyword
        )}`
      },
      json: true
    })

    return [body.totalCount as number, (body.items as any[]).map(item => {
      return {
        title: item.title as string,
        id: item.id as number,
        link: `https://store.line.me/stickershop/product/${item.id}/ko`
      }
    })]
  }

  static async initializeEmoticons (id: number, name: string) {
    // if already exists return model.
    const prev = await LineconCategoryModel.findOne({ originId: id }).exec()
    if (prev) return prev

    // download and load with parser
    const { body } = await got.get(
      `https://line.me/S/sticker/${id}/?lang=ko&ref=gnsh_stickerDetail`,
      {
        headers: {
          'User-Agent': fakeUA
        }
      }
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
        name: `${name}_${index}`,
        fullPath: animated ? gifFilePath : pngFilePath,
        thumbnailPath
      })
    }))

    return category
  }

  getCategories () {
    return LineconCategoryModel.find().exec()
  }

  async fetchEmoticons (name: string): Promise<[LineconCategory, Linecon[]] | undefined> {
    const category = await LineconCategoryModel.findOne({ name }).exec()
    if (!category) return undefined

    const linecons = await LineconModel.find({ _id: category._id }).exec()
    return [ category, linecons ]
  }

  fetchEmoticon (keyword: string) {
    return LineconModel.findOne({ name: keyword }).exec()
  }

  async renameEmoticon (origin: string, newName: string) {
    const prev = await LineconModel.findOne({ name: origin }).exec()
    if (!prev) return undefined

    prev.name = newName
    await prev.save()
    return prev
  }
}
