import { Request } from "./request"
import { Event } from "./event"

export interface Mediator {
  send<Res>(command: Request<Res>): Promise<Res>
  publish(events: Event[]): Promise<void>
}
