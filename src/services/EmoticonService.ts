import crypto from 'crypto'
import { Message, PartialMessage } from 'discord.js'
import fs from 'fs'
import got from 'got'
import _ from 'lodash'
import path from 'path'
import { URL } from 'url'
import util from 'util'
import { BOT_CONFIG } from '../configs/IConfigurations'
import { EmoticonModel, EmoticonNameModel } from '../models/Emoticon'
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

  const fullPath = await downloadFile(rawUrl)
  const [err, emoticon] = await tryCatch(EmoticonModel.create({
    name, fullPath
  }))

  if (err ?? !emoticon) {
    const error = err as Error
    LoggingQueue.errorSubject.next({ error, time: new Date(), context })
    return 0
  }

  await EmoticonNameModel.create({ name })
  return 1
}

async function duplicate (context: Message | PartialMessage, name: string, target: string) {
  const targetEmoticon = await EmoticonModel.findOne({ name: target, removed: false }).exec()
  if (!targetEmoticon) return -2

  const prev = await EmoticonModel.findOne({ name, removed: false }).exec()
  if (prev) return -1

  const [err, duplicated] = await tryCatch(EmoticonModel.create({
    name, fullPath: targetEmoticon.fullPath, equivalents: [targetEmoticon.name]
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
  }))

  await EmoticonNameModel.create({ name })
  return 1
}

async function remove (__: Message | PartialMessage, name: string) {
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
    await emoticon.save()
  }))

  return true
}

async function fetch (__: Message | PartialMessage, name: string) {
  const match = await EmoticonModel.findOne({ name, removed: false }).exec()
  if (match) {
    return match.fullPath
  }

  return undefined
}

async function search (__: Message | PartialMessage, name: string) {
  return _.uniq((await EmoticonModel.find({
    name: new RegExp(name),
    removed: false
  }).exec())).sort()
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
  remove,
  fetch,
  search,
  getEquivalents,
  getEmoticonLists
}

export default EmoticonService
