import { MessageEmbed } from 'discord.js'
import { KeyValueString, Presenter } from '../core/BasePresentedCommand'
import LineEmoticonService from '../services/LineEmoticonService'

export const presentSearchLineEmoticon: Presenter = async (map: KeyValueString) => {
  const page = map.page ? Number(map.page) : 1
  const limit = map.limit ? Number(map.limit) : 10

  const [totalCount, results] = await LineEmoticonService.searchEmoticons(
    map.keyword,
    page,
    limit
  )

  let embed = new MessageEmbed()
    .setTitle(`Search Result: ${map.keyword}`)
    .setDescription(`'${map.keyword}'에 대해 검색한 결과는 총 ${totalCount}건입니다.`)

  results.forEach(result => {
    embed = embed
      .addField(`[${result.id}] ${result.title}`, result.link, true)
  })

  return [embed]
}

export const presentInitializeLineEmoticonCategory: Presenter = async (key: KeyValueString) => {
  const { id, name } = key
  const [category, linecons] = await LineEmoticonService.initializeEmoticons(Number(id), name)

  return [
    new MessageEmbed()
      .setTitle(`라인에서 가져온 이모티콘 [${category.name}] 카테고리가 추가되었습니다.`)
      .setDescription('명령어: ' + linecons.map(linecon => `\`${linecon.name}\``).join(', '))
      .addField('원제목', category.title)
  ]
}
