import { ArgumentParser, BasePresentedCommand, Presenter } from '../../core/BasePresentedCommand'
import { CommandDefinition } from '../../core/CommandFactory'
import { presentGetRiverTemperature } from '../../presenters/Weather'

@CommandDefinition()
export class RiverTemp extends BasePresentedCommand {
  commands: string[] = ['수온', '한강수온', '자살', '한강', '퐁당']
  argsParser: ArgumentParser = () => ({})
  presenter: Presenter = presentGetRiverTemperature
}
