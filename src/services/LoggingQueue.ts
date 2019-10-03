import { Subscriber } from 'rxjs'

export class LoggingQueue {
  private static instance: LoggingQueue
  private errorSubscriber: Subscriber<Error> = new Subscriber()
  private 

  private constructor () {}

  static getInstance (): LoggingQueue {
    if (!LoggingQueue.instance) {
      LoggingQueue.instance = new LoggingQueue()
    }

    return LoggingQueue.instance
  }


}