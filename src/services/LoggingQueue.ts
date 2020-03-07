import { Subject } from 'rxjs'
import { Message, PartialMessage } from 'discord.js'

export interface ILoggingError {
  time: Date,
  error: Error,
  context?: Message | PartialMessage
}

export interface ILoggingDebug {
  title: string,
  message: string,
  context?: Message | PartialMessage,
  forced?: boolean
}

export const LoggingQueue = {
  errorSubject: new Subject<ILoggingError>(),
  debugSubject: new Subject<ILoggingDebug>()
}
