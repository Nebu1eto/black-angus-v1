import { DocumentType } from '@typegoose/typegoose'
import axios from 'axios'
import crypto from 'crypto'
import { Message } from 'discord.js'
import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import { URL } from 'url'
import util from 'util'
import { BOT_CONFIG } from '../configs/IConfigurations'
import { Emoticon, EmoticonActionType, EmoticonLogModel, EmoticonModel, EmoticonNameModel } from '../models/Emoticon'
import { tryCatch } from '../utils/tryCatch'
import { LoggingQueue } from './LoggingQueue'
import { ko } from 'date-fns/locale'
import { format } from 'date-fns'

const writeFile = util.promisify(fs.writeFile)
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

  private getFileName (file: Buffer) {
    return crypto
      .createHash('sha1')
      .update(file)
      .digest('hex')
  }

  private async downloadFile (rawUrl: string) {
    const url = new URL(rawUrl)
    const { data } = await axios({
      method: 'get',
      url: rawUrl,
      responseType: 'arraybuffer'
    })

    const paths = url.pathname.split('/')
    const extension = (() => {
      const extname = path.extname(paths[paths.length - 1])
      const preservedExts = ['.jpg', '.png', '.gif']
      return preservedExts.indexOf(extname) === -1 ? '.jpg' : extname
    })()

    const file = Buffer.from(data, 'binary')
    const fileName = path.join(
      BOT_CONFIG.EMOTICON_FILE_PATH,
      `${this.getFileName(file)}${extension}`
    )

    // create file if not exists. ;)
    const [err] = await tryCatch(stat(fileName))
    if (err) {
      await writeFile(fileName, file)
    }

    return fileName
  }

  private insertLog (type: EmoticonActionType, context: Message, emoticon: DocumentType<Emoticon>) {
    return EmoticonLogModel.create({
      type,
      context: `[${format(new Date(), 'yyyy. MM. dd. a hh:mm:ss', {
        locale: ko
      })}] <${context.author.username}#${context.author.discriminator}> ${
        context.content
      }`,
      emoticon
    })
  }

  public async upload (context: Message, name: string, rawUrl: string) {
    const prev = await EmoticonModel.findOne({ name, removed: false }).exec()
    if (prev) return `${name} 항목이 이미 존재합니다.`

    const path = await this.downloadFile(rawUrl)
    const [err, emoticon] = await tryCatch(EmoticonModel.create({
      name, path
    }))

    if (err) {
      LoggingQueue.errorSubject.next({ error: err, time: new Date(), context })
      return `${name} 항목을 추가하는 중 오류가 발생했습니다.`
    }

    await EmoticonNameModel.create({ name })
    await this.insertLog(EmoticonActionType.CREATE, context, emoticon!)
    return `${name} 항목을 데이터베이스에 추가했습니다.`
  }

  public async duplicate (context: Message, name: string, target: string) {
    const targetEmoticon = await EmoticonModel.findOne({ name: target, removed: false }).exec()
    if (!targetEmoticon) return `${target} 항목이 존재하지 않습니다.`

    const prev = await EmoticonModel.findOne({ name, removed: false }).exec()
    if (prev) return `${name} 항목이 이미 존재합니다.`

    const [err, duplicated] = await tryCatch(EmoticonModel.create({
      name, path: targetEmoticon.path, equivalents: [ targetEmoticon.name ]
    }))

    if (err) {
      LoggingQueue.errorSubject.next({ error: err, time: new Date(), context })
      return `${name} 항목을 추가하는 중 오류가 발생했습니다.`
    }

    const equivalents = await EmoticonModel.find({
      name: { $in: [...targetEmoticon.equivalents, target] }
    }).exec()

    await Promise.all(equivalents.map(async emoticon => {
      emoticon.equivalents.push(name)
      emoticon.updatedAt = new Date()
      await emoticon.save()
      await this.insertLog(EmoticonActionType.UPDATE, context, emoticon)
    }))

    await EmoticonNameModel.create({ name })
    await this.insertLog(EmoticonActionType.CREATE, context, duplicated!)
    return `${name} 항목을 데이터베이스에 추가했습니다.`
  }

  public async update (context: Message, name: string, newUrl: string) {
    const prev = await EmoticonModel.findOne({ name, removed: false }).exec()
    if (!prev) return `${name} 항목이 존재하지 않습니다.`

    const list = [...prev.equivalents, prev.name]
    const newPath = await this.downloadFile(newUrl)
    const emoticons = await EmoticonModel.find({
      removed: false,
      name: { $in: list }
    }).exec()

    // update self and equivalent emoticon's path
    await Promise.all(emoticons.map(async emoticon => {
      emoticon.path = newPath
      emoticon.updatedAt = new Date()
      await emoticon.save()
      await this.insertLog(EmoticonActionType.UPDATE, context, emoticon)
    }))

    return `${prev.name} 이모티콘과 동의어 ${emoticons.length - 1}개를 업데이트하였습니다.`
  }

  public async delete (context: Message, name: string) {
    const prev = await EmoticonModel.findOne({ name, removed: false }).exec()
    if (!prev) return `${name} 항목이 존재하지 않습니다.`

    prev.removed = true
    prev.updatedAt = new Date()
    await prev.save()

    // remove name index too.
    await EmoticonNameModel.remove({ name }).exec()

    // remove equivalents too.
    const equivalents = await EmoticonModel.find({
      equivalents: { $in: prev.equivalents },
      removed: false
    }).exec()

    await Promise.all(equivalents.map(async emoticon => {
      emoticon.equivalents = emoticon.equivalents.filter(str => str !== name)
      emoticon.updatedAt = new Date()
      await this.insertLog(EmoticonActionType.UPDATE, context, emoticon)
      await emoticon.save()
    }))

    await this.insertLog(EmoticonActionType.DELETE, context, prev)
    return `${name} 항목을 성공적으로 삭제했습니다.`
  }

  public async fetchOrSearch (context: Message, name: string) {
    // 1. find exactly match
    const match = await EmoticonModel.findOne({ name, removed: false }).exec()
    if (match) {
      await this.insertLog(EmoticonActionType.READ, context, match)
      return {
        matched: true,
        value: match.path
      }
    }

    // 2. find simillar one
    const searched = await EmoticonModel.find({
      name: new RegExp(name),
      removed: false
    }).exec()

    return {
      matched: false,
      value: _.uniq(searched.map(emoticon => emoticon.name)).sort()
    }
  }

  public async getEquivalents (name: string) {
    const emoticon = await EmoticonModel.findOne({ name, removed: false }).exec()
    if (emoticon) {
      return `${name} 항목의 동의어는 다음과 같습니다: ${emoticon.equivalents.join(', ')}`
    }

    return `${name} 항목이 존재하지 않습니다.`
  }

  public async getEmoticonLists () {
    const result = await EmoticonNameModel.find().exec()
    return _.uniq(result.map(r => r.name))
  }
}
