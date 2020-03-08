// THIS SCRIPT IS PERSONAL MIGRATION SCRIPT
// IT IS NOT FOR GENERAL PURPOSE.
import _ from 'lodash'
import { DocumentType } from '@typegoose/typegoose'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import crypto from 'crypto'
import debug from 'debug'
import fs from 'fs'
import path from 'path'
import util from 'util'
import { BOT_CONFIG } from '../src/configs/IConfigurations'
import {
  Emoticon,
  EmoticonActionType,
  EmoticonLogModel,
  EmoticonModel,
  EmoticonNameModel
} from '../src/models/Emoticon'
import { connectDatabase } from '../src/utils/connectDatabase'
import { tryCatch } from '../src/utils/tryCatch'

// set logger
const logger = debug('Migration: ')
logger.enabled = true

// util functions
const stat = util.promisify(fs.stat)
const mkdir = util.promisify(fs.mkdir)
const copyFile = util.promisify(fs.copyFile)

// put migration logics in async function ;)
async function migrate () {
  // 1. connect database
  await connectDatabase()

  // 2. create emoticon folder if not exists.
  const [err, folder] = await tryCatch(stat(BOT_CONFIG.EMOTICON_FILE_PATH))
  if (err) {
    await mkdir(BOT_CONFIG.EMOTICON_FILE_PATH)
  }

  if (folder && !folder.isDirectory()) {
    throw new Error('Emoticon Path must be folder or empty.')
  }

  // 3. import Key-Value JSON Files
  const basePath = process.env.RAW_JSON_FILE ?? './env/config.json'
  const rawBasePath = basePath.startsWith('.') ? path.join(process.cwd(), basePath) : basePath
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rawMap: { [key: string]: string } = require(rawBasePath)

  // 4. rename as sha-1 hash and move files, create map of file names
  const fileNameMap: { [key: string]: string } = {}
  await Promise.all(Object.values(rawMap).map(async relPath => {
    try {
      const realPath = path.join(rawBasePath, './../../', relPath)
      const hashPath = path.join(BOT_CONFIG.EMOTICON_FILE_PATH,
        `${await getHashOfFile(realPath)}${path.extname(realPath)}`
      )

      fileNameMap[realPath] = hashPath
      await tryCatch(copyFile(realPath, hashPath))
    } catch (_) {

    }
  }))

  // 5. create map of file name and emoticon
  const tmp = Object.keys(rawMap).map(fullName => {
    const name = fullName.substring(1, fullName.length)
    const newPath =
      fileNameMap[path.join(rawBasePath, './../../', rawMap[fullName])]
    return { [name]: newPath }
  }).reduce((prev, after) => ({ ...prev, ...after }))

  const fileEmoticons = _.groupBy(
    Object.keys(tmp), obj => tmp[obj]
  )

  await Promise.all(Object.keys(fileEmoticons).map(async hashPath => {
    // 6-1. save first elem of array
    const emoticons = fileEmoticons[hashPath]
    await upload(emoticons[0], hashPath)

    // 6-2. register equivalents another elements of array
    if (emoticons.length > 1) {
      const sliced = emoticons.slice(1, emoticons.length)
      for (const emoticon of sliced) {
        await duplicate(emoticon, emoticons[0])
      }
    }
  }))

  // finish
  logger('Finishing Migration...')
}

function getHashOfFile (path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const shasum = crypto.createHash('sha1')
    try {
      const stream = fs.createReadStream(path)
      stream.on('data', data => {
        shasum.update(data)
      })

      stream.on('end', () => {
        const hash = shasum.digest('hex')
        return resolve(hash)
      })
    } catch (error) {
      return reject(error)
    }
  })
}

function insertLog (type: EmoticonActionType, emoticon: DocumentType<Emoticon>) {
  return EmoticonLogModel.create({
    type,
    context: `[${format(new Date(), 'yyyy. MM. dd. a hh:mm:ss', {
      locale: ko
    })}] <Migration from Previous Bot>`,
    emoticon
  })
}

async function upload (name: string, path: string) {
  const prev = await EmoticonModel.findOne({ name, removed: false }).exec()
  if (prev) return false

  const [err, emoticon] = await tryCatch(EmoticonModel.create({
    name, path
  }))

  if (err ?? !emoticon) return false

  await EmoticonNameModel.create({ name })
  await insertLog(EmoticonActionType.CREATE, emoticon)
  return true
}

async function duplicate (name: string, target: string) {
  const targetEmoticon = await EmoticonModel.findOne({ name: target, removed: false }).exec()
  if (!targetEmoticon) return false

  const prev = await EmoticonModel.findOne({ name, removed: false }).exec()
  if (prev) return false

  const [err, duplicated] = await tryCatch(EmoticonModel.create({
    name, path: targetEmoticon.path, equivalents: [targetEmoticon.name]
  }))

  if (err ?? !duplicated) return false

  const equivalents = await EmoticonModel.find({
    name: { $in: [...targetEmoticon.equivalents, target] }
  }).exec()

  await Promise.all(equivalents.map(async emoticon => {
    emoticon.equivalents.push(name)
    emoticon.updatedAt = new Date()
    await emoticon.save()
    await insertLog(EmoticonActionType.UPDATE, emoticon)
  }))

  await EmoticonNameModel.create({ name })
  await insertLog(EmoticonActionType.CREATE, duplicated)
  return true
}

migrate().then(() => {
  logger('Success to Migration!')
  process.exit(0)
}).catch(err => {
  logger('Failure to Migration.')
  logger(err)
})
