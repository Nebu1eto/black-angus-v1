import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { presentGetWeather } from '../../presenters/Weather'

@CommandDefinition()
export class Weather extends BasePresentedCommand {
  commands: string[] = ['날씨', '기온', '미세먼지', 'AQI', 'aqi', '대기', '대기질']
  argsParser: ArgumentParser = ({ content }) => ({
    keyword: content.substring(content.indexOf(' ') + 1)
  })
  presenter: Presenter = presentGetWeather
}
