import { Event } from "./interface/event"
import { EventHandler, Handler } from "./interface/handler"
import { Class, Ioc } from "./interface/ioc"
import { Mediator } from "./interface/mediator"
import { Request } from "./interface/request"

export type RequestsMap = Map<Class<Request<any>>, Class<Handler<Request<any>, any>>>
export type EventsMap = Map<Class<Event>, Class<EventHandler<Event>>[]>


export class MediatorImpl implements Mediator {
  constructor(
    private readonly requestsMap: RequestsMap,
    private readonly eventsMap: EventsMap,
    private readonly ioc: Ioc,
  ) {}

  async send<R extends Request<Res>, Res>(request: R): Promise<Res> {
    const handlerType = this.requestsMap.get(request.constructor as Class<Request<any>>)
    if (!handlerType) {
      throw new Error(`Handler for request ${request.constructor} not found`)
    }
    return await this.ioc.provide(handlerType, async (handler: Handler<R, Res>) => {
      return await handler.handle(request)
    })
  }

  async publish(events: Event[]): Promise<void> {
    for (const event of events) {
      let handlersTypes = this.eventsMap.get(event.constructor as Class<Event>) 
      if (handlersTypes === undefined) {
        handlersTypes = []
      }
      for (const handlerType of handlersTypes) {
        await this.ioc.provide(handlerType, async (handler: EventHandler<Event>) => {
          await handler.handle(event)
        })
      }
    }
  }
}

export class MediatorFactory {
  private readonly requestsMap: RequestsMap
  private readonly eventsMap: EventsMap

  constructor() {
    this.requestsMap = new Map()
    this.eventsMap = new Map()
  }

  registerRequest<
    Res,
    Req extends Request<Res>,
    ReqHandler extends Handler<Req, Res>,
    RequestType extends Class<Req>,
    HandlerType extends Class<ReqHandler>,
  >(
    requestType: RequestType,
    handler: HandlerType,
  ): void {
    this.requestsMap.set(requestType, handler)
  }

  registerEvents<
    E extends Event,
    EHandler extends EventHandler<E>,
    EventType extends Class<E>,
    EHandlerType extends Class<EHandler>,
    >(
    eventType: EventType,
    handlers: EHandlerType[],
  ): void {
    this.eventsMap.set(eventType, handlers)
  }

  createMediator(ioc: Ioc): Mediator {
    return new MediatorImpl(this.requestsMap, this.eventsMap, ioc)
  }
}
