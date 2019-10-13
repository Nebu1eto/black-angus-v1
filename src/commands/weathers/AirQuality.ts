import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { presentGetAirQuality } from '../../presenters/Weather'
import { weatherLocationParser } from '../../parsers/Weather'

@CommandDefinition()
export class AirQuality extends BasePresentedCommand {
  commands: string[] = ['미세먼지', 'AQI', 'aqi', '대기', '대기질']
  argsParser: ArgumentParser = weatherLocationParser
  presenter: Presenter = presentGetAirQuality
}
