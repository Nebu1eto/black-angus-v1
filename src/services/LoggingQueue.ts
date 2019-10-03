import { Subject } from 'rxjs'
import { Message } from 'discord.js'

export interface ILoggingError {
  time: Date,
  error: Error,
  context: Message
}

export const LoggingQueue = {
  errorSubject: new Subject<ILoggingError>(),
  debugSubject: new Subject<string[]>()
}
