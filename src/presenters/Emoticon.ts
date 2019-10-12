import { Presenter, KeyValueString } from '../core/BasePresentedCommand'
import { EmoticonService } from '../services/EmoticonService'
import { Message } from 'discord.js'

export const presentFetchEmoticon: Presenter = async (map: KeyValueString, context: Message) => {
  const file = await EmoticonService.getInstance().fetch(context, map.name)
  return file
    ? [{ file }]
    : [`'${map.name}' 이름의 이모티콘을 찾을 수 없습니다.`]
}
