import { MessageAttachment, Message, PartialMessage } from 'discord.js'
import { KeyValueString, Presenter } from '../core/BasePresentedCommand'
import EmoticonService from '../services/EmoticonService'

export const presentFetchEmoticon: Presenter = async (map: KeyValueString, context: Message | PartialMessage) => {
  const file = await EmoticonService.fetch(context, map.name)
  return file ? [{
    files: [
      { attachment: file }
    ]
  }] : undefined
}

export const presentUploadEmoticon: Presenter = async (map: KeyValueString, context: Message | PartialMessage) => {
  const { name, url } = map
  const result = await EmoticonService.upload(context, name, url)
  switch (result) {
    case 0:
      return [`${name} 항목을 추가하는 중 오류가 발생했습니다.`]
    case 1:
      return [`${name} 항목을 데이터베이스에 추가했습니다.`]
    default:
      return [`${name} 항목이 이미 존재합니다.`]
  }
}

export const presentDuplicateEmoticon: Presenter = async (map: KeyValueString, context: Message | PartialMessage) => {
  const { name, target } = map
  const result = await EmoticonService.duplicate(context, name, target)
  switch (result) {
    case -2:
      return [`${target} 항목이 존재하지 않습니다.`]
    case -1:
      return [`${name} 항목이 이미 존재합니다.`]
    case 1:
      return [`${name} 항목을 데이터베이스에 추가했습니다.`]
    default:
      return [`${name} 항목을 추가하는 중 오류가 발생했습니다.`]
  }
}

export const presentUpdateEmoticon: Presenter = async (map: KeyValueString, context: Message | PartialMessage) => {
  const { name, url } = map
  const results = await EmoticonService.update(context, name, url)
  if (!results) return [`${name} 항목이 존재하지 않습니다.`]
  return [
    // results에는 자기 자신도 포함되어있기 때문에 length - 1 해야함.
    `${name} 이모티콘과 동의어 ${results.length - 1}개를 업데이트하였습니다.`
  ]
}

export const presentDeleteEmoticon: Presenter = async (map: KeyValueString, context: Message | PartialMessage) => {
  const result = await EmoticonService.remove(context, map.name)
  return [
    result
      ? `${map.name} 항목이 존재하지 않습니다.`
      : `${map.name} 항목을 성공적으로 삭제했습니다.`
  ]
}

export const presentSearchEmoticon: Presenter = async (map: KeyValueString, context: Message | PartialMessage) => {
  const result = await EmoticonService.search(context, map.name)
  return [`데이터베이스를 조회한 결과, 요청하신 '${map.name}' 키워드를 포함하는 항목 ${
    result.length
  }건이 존재합니다.${
    result.length > 0
      ? `\n - \`${(result.map(emoticon => emoticon.name)).join('`, `')}\``
      : ''
  }`]
}

export const presentGetEquivalentsEmoticon: Presenter = async (map: KeyValueString) => {
  const equivalents = await EmoticonService.getEquivalents(map.name)
  return [
    equivalents
     ? `${map.name} 항목의 동의어는 다음과 같습니다: \`${equivalents.join('`, `')}\``
     : `${map.name} 항목이 존재하지 않습니다.`
  ]
}

export const presentListEmoticon: Presenter = async () => {
  const result = await EmoticonService.getEmoticonLists()

  return [
    '현재 기준 디시콘 목록입니다.', new MessageAttachment(
      Buffer.from(result.sort().join('\n'), 'utf8'),
    'dccon_list.txt')
  ]
}
