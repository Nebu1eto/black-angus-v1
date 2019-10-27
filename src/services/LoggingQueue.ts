import { Subject } from 'rxjs'
import { Message } from 'discord.js'

export interface ILoggingError {
  time: Date,
  error: Error,
  context?: Message
}

export interface ILoggingDebug {
  title: string,
  message: string,
  context?: Message,
  forced?: boolean
}

export const LoggingQueue = {
  errorSubject: new Subject<ILoggingError>(),
  debugSubject: new Subject<ILoggingDebug>()
}
