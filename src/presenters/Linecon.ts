import { RichEmbed } from 'discord.js'
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
