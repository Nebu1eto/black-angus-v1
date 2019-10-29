import { RichEmbed, Attachment } from 'discord.js'
import path from 'path'
import { KeyValueString, Presenter } from '../core/BasePresentedCommand'
import LineconService from '../services/LineconService'

export const presentSearchLinecon: Presenter = async (map: KeyValueString) => {
  const page = map.page ? Number(map.page) : 1
  const limit = map.limit ? Number(map.limit) : 10

  const [totalCount, results] = await LineconService.searchEmoticons(
    map.keyword,
    page,
    limit
  )

  let embed = new RichEmbed()
    .setTitle(`Search Result: ${map.keyword}`)
    .setDescription(`'${map.keyword}'에 대해 검색한 결과는 총 ${totalCount}건입니다.`)

  results.forEach(result => {
    embed = embed
      .addField(`[${result.id}] ${result.title}`, result.link, true)
  })

  return [ embed ]
}

export const presentInitializeLineconCategory: Presenter = async (key: KeyValueString) => {
  const { id, name } = key
  const [ category, linecons ] = await LineconService.initializeEmoticons(Number(id), name)

  return [
    new RichEmbed()
      .setTitle(`라인콘 [${category.name}] 카테고리가 추가되었습니다.`)
      .setDescription('명령어: ' + linecons.map(linecon => `\`${linecon.name}\``).join(', '))
      .addField('원제목', category.title)
  ]
}

export const presentFetchLineconCategory: Presenter = async (key: KeyValueString) => {
  const result = await LineconService.fetchEmoticons(key.name)
  if (!result) {
    return [`'${key.name}' 라인콘에 대한 검색 결과가 없습니다.`]
  }

  const [ category, linecons ] = result
  return [
    new RichEmbed()
      .setTitle(`라인콘 카테고리 [${category.name}]`)
      .setDescription('명령어: ' + linecons.map(linecon => `\`${linecon.name}\``).join(', '))
      .addField('원제목', category.title)
  ]
}

export const presentFetchLinecon: Presenter = async (key: KeyValueString) => {
  const result = await LineconService.fetchEmoticon(key.name)
  return result ? [{ file: result.fullPath }] : undefined
}

export const presentRenameLinecon: Presenter = async (key: KeyValueString) => {
  const { keyword, newKeyword } = key
  const result = await LineconService.renameEmoticon(keyword, newKeyword)
  if (!result) {
    return [`'${keyword}' 라인콘에 대한 검색 결과가 없습니다.`]
  }

  return [
    new RichEmbed()
      .setTitle('라인콘 변경')
      .setDescription(`라인콘 [${keyword}] 명령어가 [${newKeyword}]로 바뀌었습니다.`)
      .attachFile(result.thumbnailPath)
      .setImage(`attachment://${path.parse(result.thumbnailPath).base}`)
  ]
}

export const presentListLinecon: Presenter = async (key: KeyValueString) => {
  const result = (await LineconService.getLinecons()).map(con => con.name)
  return [
    '현재 기준 라인콘 목록입니다.',
    new Attachment(
      Buffer.from(result.sort().join('\n'), 'utf8'),
      'dccon_list.txt'
    )
  ]
}
