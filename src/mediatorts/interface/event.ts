export abstract class Event {
  readonly timestamp: number

  constructor (timestamp: number = Date.now()) {
    this.timestamp = timestamp
  }
}
