import { DocumentType } from '@typegoose/typegoose'
import crypto from 'crypto'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Message, PartialMessage } from 'discord.js'
import fs from 'fs'
import got from 'got'
import _ from 'lodash'
import path from 'path'
import { URL } from 'url'
import util from 'util'
import { BOT_CONFIG } from '../configs/IConfigurations'
import { Emoticon, EmoticonActionType, EmoticonLogModel, EmoticonModel, EmoticonNameModel } from '../models/Emoticon'
import { tryCatch } from '../utils/tryCatch'
import { LoggingQueue } from './LoggingQueue'

const writeFile = util.promisify(fs.writeFile)
const mkdir = util.promisify(fs.mkdir)
const stat = util.promisify(fs.stat)

function getFileName (file: Buffer) {
  return crypto
    .createHash('sha1')
    .update(file)
    .digest('hex')
}

async function downloadFile (rawUrl: string) {
  const url = new URL(rawUrl)
  const body = await got.get(rawUrl, {
    retry: 3
  }).buffer()

  const paths = url.pathname.split('/')
  const extension = (() => {
    const extname = path.extname(paths[paths.length - 1])
    const preservedExts = ['.jpg', '.png', '.gif']
    return !preservedExts.includes(extname) ? '.jpg' : extname
  })()

  const fileName = path.join(
    BOT_CONFIG.EMOTICON_FILE_PATH,
    `${getFileName(body)}${extension}`
  )

  // create file if not exists. ;)
  const [err] = await tryCatch(stat(fileName))
  if (err) {
    await writeFile(fileName, body)
  }

  return fileName
}

function insertLog (type: EmoticonActionType, context: Message | PartialMessage, emoticon: DocumentType<Emoticon>) {
  return EmoticonLogModel.create({
    type,
    context: `[${format(new Date(), 'yyyy. MM. dd. a hh:mm:ss', {
      locale: ko
    })}] <${context.author?.username}#${context.author?.discriminator}> ${
      context.content
    }`,
    emoticon
  })
}

async function initialize () {
  const [err, result] = await tryCatch(stat(BOT_CONFIG.EMOTICON_FILE_PATH))
  if (err) {
    await mkdir(BOT_CONFIG.EMOTICON_FILE_PATH)
    return
  }

  if (result && !result.isDirectory()) {
    throw new Error('Emoticon Path must be folder or empty.')
  }
}

async function upload (context: Message | PartialMessage, name: string, rawUrl: string) {
  const prev = await EmoticonModel.findOne({ name, removed: false }).exec()
  if (prev) return -1

  const path = await downloadFile(rawUrl)
  const [err, emoticon] = await tryCatch(EmoticonModel.create({
    name, path
  }))

  if (err ?? !emoticon) {
    const error = err as Error
    LoggingQueue.errorSubject.next({ error, time: new Date(), context })
    return 0
  }

  await EmoticonNameModel.create({ name })
  await insertLog(EmoticonActionType.CREATE, context, emoticon)
  return 1
}

async function duplicate (context: Message | PartialMessage, name: string, target: string) {
  const targetEmoticon = await EmoticonModel.findOne({ name: target, removed: false }).exec()
  if (!targetEmoticon) return -2

  const prev = await EmoticonModel.findOne({ name, removed: false }).exec()
  if (prev) return -1

  const [err, duplicated] = await tryCatch(EmoticonModel.create({
    name, path: targetEmoticon.path, equivalents: [targetEmoticon.name]
  }))

  if (err ?? !duplicated) {
    const error = err as Error
    LoggingQueue.errorSubject.next({ error, time: new Date(), context })
    return 0
  }

  const equivalents = await EmoticonModel.find({
    name: { $in: [...targetEmoticon.equivalents, target] }
  }).exec()

  await Promise.all(equivalents.map(async emoticon => {
    emoticon.equivalents.push(name)
    emoticon.updatedAt = new Date()
    await emoticon.save()
    await insertLog(EmoticonActionType.UPDATE, context, emoticon)
  }))

  await EmoticonNameModel.create({ name })
  await insertLog(EmoticonActionType.CREATE, context, duplicated)
  return 1
}

async function update (context: Message | PartialMessage, name: string, newUrl: string) {
  const prev = await EmoticonModel.findOne({ name, removed: false }).exec()
  if (!prev) return undefined

  const list = [...prev.equivalents, prev.name]
  const newPath = await downloadFile(newUrl)
  const emoticons = await EmoticonModel.find({
    removed: false,
    name: { $in: list }
  }).exec()

  // update self and equivalent emoticon's path
  await Promise.all(emoticons.map(async emoticon => {
    emoticon.path = newPath
    emoticon.updatedAt = new Date()
    await emoticon.save()
    await insertLog(EmoticonActionType.UPDATE, context, emoticon)
  }))

  return emoticons
}

async function remove (context: Message | PartialMessage, name: string) {
  const prev = await EmoticonModel.findOne({ name, removed: false }).exec()
  if (!prev) return false

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
    await insertLog(EmoticonActionType.UPDATE, context, emoticon)
    await emoticon.save()
  }))

  await insertLog(EmoticonActionType.DELETE, context, prev)
  return true
}

async function fetch (context: Message | PartialMessage, name: string) {
  const match = await EmoticonModel.findOne({ name, removed: false }).exec()
  if (match) {
    await insertLog(EmoticonActionType.READ, context, match)
    return match.path
  }

  return undefined
}

async function search (context: Message | PartialMessage, name: string) {
  const searched = _.uniq((await EmoticonModel.find({
    name: new RegExp(name),
    removed: false
  }).exec())).sort()

  await Promise.all(searched.map(search => {
    return insertLog(EmoticonActionType.SEARCH, context, search)
  }))

  return searched
}

async function getEquivalents (name: string) {
  const emoticon = await EmoticonModel.findOne({ name, removed: false }).exec()
  return (!emoticon) ? undefined : emoticon.equivalents
}

async function getEmoticonLists () {
  const result = await EmoticonNameModel.find({}).exec()
  return _.uniq(result.map(r => r.name))
}

const EmoticonService = {
  initialize,
  upload,
  duplicate,
  update,
  remove,
  fetch,
  search,
  getEquivalents,
  getEmoticonLists
}

export default EmoticonService
