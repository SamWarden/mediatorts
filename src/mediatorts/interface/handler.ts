import { Event } from "./event"
import { Request } from "./request"


export interface Handler<R extends Request<RRes>, RRes> {
  handle(request: R): Promise<RRes>
}


export interface EventHandler<E extends Event> {
  handle(event: E): Promise<void>
}
