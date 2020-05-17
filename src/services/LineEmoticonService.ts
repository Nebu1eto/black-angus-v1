// Thanks to Siwon Kim, for Proof of Concept.
import cheerio from 'cheerio'
import fs from 'fs'
import got from 'got'
import path from 'path'
import sharp from 'sharp'
import { URLSearchParams } from 'url'
import util from 'util'
import { BOT_CONFIG } from '../configs/IConfigurations'
import { Emoticon, EmoticonCategory, EmoticonCategoryModel, EmoticonModel, EmoticonType } from '../models/Emoticon'
import apng2gif from '../utils/apng2gif'
import { isAnimatedPng } from '../utils/imageMeta'
import { tryCatch } from '../utils/tryCatch'
import { LoggingQueue } from './LoggingQueue'

const appendFile = util.promisify(fs.appendFile)
const mkdir = util.promisify(fs.mkdir)
const stat = util.promisify(fs.stat)
const fakeUA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/79.0.3919.0 Safari/537.36'

export interface SearchResult {
  title: string,
  id: number,
  link: string,
}

async function initialize () {
  const [err, result] = await tryCatch(stat(BOT_CONFIG.LINECON_FILE_PATH))
  if (err) {
    await mkdir(BOT_CONFIG.LINECON_FILE_PATH)
    return
  }

  if (result && !result.isDirectory()) {
    throw new Error('Emoticon Path must be folder or empty.')
  }
}

async function searchEmoticons (keyword: string, page: number = 1, limit: number = 10): Promise<[number, SearchResult[]]> {
  // download and load with parser
  const body: any = await got.get('https://store.line.me/api/search/sticker', {
    headers: {
      'User-Agent': fakeUA,
      'X-Requested-With': 'XMLHttpRequest',
      Referrer: `https://store.line.me/search/sticker/ko?q=${encodeURIComponent(
        keyword
      )}`
    },
    searchParams: new URLSearchParams([
      ['query', keyword],
      ['offset', `${limit * (page - 1)}`],
      ['limit', `${limit}`],
      ['type', 'ALL'],
      ['includeFacets', 'true']
    ])
  }).json()

  return [body.totalCount as number, (body.items as any[]).map(item => {
    return {
      title: item.title as string,
      id: item.id as number,
      link: `https://store.line.me/stickershop/product/${item.id}/ko`
    }
  })]
}

async function initializeEmoticons (id: number, name: string): Promise<[EmoticonCategory, Emoticon[]]> {
  // if already exists return model.
  const prev = await EmoticonCategoryModel.findOne({
    originId: id,
    type: EmoticonType.LINE,
  }).exec()

  if (prev) {
    return [prev, await EmoticonModel.find({ category: prev._id }).exec()]
  }

  // download and load with parser
  const referenceLink = `https://line.me/S/sticker/${id}/?lang=ko&ref=gnsh_stickerDetail`
  const { body } = await got.get(
    referenceLink,
    {
      headers: {
        'User-Agent': fakeUA
      }
    }
  )

  const $ = cheerio.load(body)

  // get title and urls
  const title = $('p.mdCMN38Item01Ttl').text()
  const emoticonUrls = ((Array.from(
    $('li.mdCMN09Li.FnStickerPreviewItem')
      .map((_, element) => {
        const target = element.attribs['data-preview']
        if (!target) return undefined

        const baseData = JSON.parse(target)
        return baseData.animationUrl
          ? baseData.animationUrl as string | undefined
          : baseData.staticUrl as string | undefined
      })
  ) as unknown) as Array<string | undefined>)
    .filter(value => value !== undefined) as string[]

  // create folder, and download images
  const folderPath = path.join(BOT_CONFIG.LINECON_FILE_PATH, `${id}`)
  await mkdir(folderPath)
  const category = await EmoticonCategoryModel.create({
    type: EmoticonType.LINE, title, originId: id, name, referenceLink, path: folderPath
  })

  await Promise.all(emoticonUrls.map(async (url, index) => {
    // 1. download original file
    const body = await got.get(url, {
      retry: 3
    }).buffer()

    const pngFilePath = path.join(folderPath, `i_${index}.png`)
    const thumbnailPath = path.join(folderPath, `t_${index}.png`)
    const gifFilePath = path.join(folderPath, `i_${index}.gif`)
    await appendFile(pngFilePath, body)

    // 2. check if it is animated png, convert it
    let animated = false
    if (isAnimatedPng(body)) {
      animated = true
      const [error] = await tryCatch(apng2gif(pngFilePath, gifFilePath, {}))
      if (error) {
        LoggingQueue.errorSubject.next({
          time: new Date(), error
        })
      }
    }

    await sharp(pngFilePath)
      .resize(200, 200)
      .png()
      .toFile(thumbnailPath)

    return await EmoticonModel.create({
      type: EmoticonType.LINE,
      category,
      animated,
      voiceAttached: false,
      name: `${name}_${index}`,
      fullPath: animated ? gifFilePath : pngFilePath,
      thumbnailPath
    })
  }))

  const emoticons = await EmoticonModel.find({ category: category._id }).exec()

  LoggingQueue.debugSubject.next({
    title: 'Debug LineEmoticon - Category',
    message: JSON.stringify(category.toJSON()),
    forced: true
  })

  LoggingQueue.debugSubject.next({
    title: 'Debug LineEmoticon - LineEmoticons',
    message: JSON.stringify(emoticons.map(emoticon => emoticon.toJSON())),
    forced: true
  })

  return [category, emoticons]
}

const LineEmoticonService = {
  initialize,
  searchEmoticons,
  initializeEmoticons,
}

export default LineEmoticonService
